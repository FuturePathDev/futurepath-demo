'use strict';

/**
 * MentorsInviteDemo Lambda
 * - POST /mentors/invite     -> create an invite
 * - GET  /mentors/invite     -> list invites by studentEmail
 *
 * DynamoDB PK/SK:
 *   PK: studentEmail (String)
 *   SK: inviteId     (String)
 *
 * Env (Amplify injects):
 *   STORAGE_FUTUREPATHMENTORINVITESDEMO_NAME
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');

const TABLE = process.env.STORAGE_FUTUREPATHMENTORINVITESDEMO_NAME;
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
};

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: CORS, body: '' };
    }
    if (!TABLE) throw new Error('Missing env STORAGE_FUTUREPATHMENTORINVITESDEMO_NAME');

    switch (event.httpMethod) {
      case 'GET':
        return await handleGet(event);
      case 'POST':
        return await handlePost(event);
      default:
        return respond(405, { message: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('ERROR', err);
    return respond(500, { message: err?.message || 'Internal error' });
  }
};

function respond(code, body) {
  return { statusCode: code, headers: CORS, body: JSON.stringify(body ?? {}) };
}

function parseJSON(body) {
  try {
    return body ? JSON.parse(body) : {};
  } catch {
    return {};
  }
}

function getClaims(event) {
  return (
    event?.requestContext?.authorizer?.claims ||
    event?.requestContext?.authorizer ||
    {}
  );
}

function rid() {
  // simple unique-ish id without extra deps
  return (
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10)
  );
}

/** GET /mentors/invite?studentEmail=...&limit=10 */
async function handleGet(event) {
  const q = event?.queryStringParameters || {};
  const studentEmail = (q.studentEmail || '').trim();
  const limit = Math.max(1, Math.min(50, Number(q.limit || 10)));

  if (!studentEmail) {
    return respond(400, { message: 'Provide ?studentEmail=' });
  }

  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'studentEmail = :s',
      ExpressionAttributeValues: { ':s': studentEmail },
      Limit: limit,
      ScanIndexForward: false, // newest first if your inviteId is time-based-ish
    })
  );

  return respond(200, {
    invites: res?.Items || [],
    total: res?.Count || 0,
    studentEmail,
    limit,
  });
}

/** POST /mentors/invite  { mentorId, mentorName, studentEmail, studentName?, parentEmail?, parentName?, message? } */
async function handlePost(event) {
  const body = parseJSON(event.body);
  const claims = getClaims(event);

  const mentorId = (body.mentorId || '').trim();
  const mentorName = (body.mentorName || '').trim();
  const studentEmail = (body.studentEmail || '').trim();

  if (!mentorId || !mentorName || !studentEmail) {
    return respond(400, {
      message: 'Missing required fields: { mentorId, mentorName, studentEmail }',
    });
  }

  const item = {
    studentEmail,                   // PK
    inviteId: rid(),                // SK
    mentorId,
    mentorName,
    studentName: body.studentName || null,
    parentEmail: body.parentEmail || claims?.email || null,
    parentName: body.parentName || null,
    message: body.message || null,
    status: 'invited',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await ddb.send(
    new PutCommand({
      TableName: TABLE,
      Item: item,
    })
  );

  return respond(200, { invite: item });
}

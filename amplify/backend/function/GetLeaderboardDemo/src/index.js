'use strict';

/**
 * GetLeaderboardDemo (Students)
 * Supports:
 *   GET /leaderboard
 *     ?limit=10
 *     ?schoolId=S-001     <-- NEW
 *
 * Data model (DynamoDB):
 *   Table: STORAGE_FUTUREPATHLEADERBOARDSDEMO_NAME
 *   PK: bucket (e.g., "grade9", "grade10", "grade11", "grade12", "middleSchool")
 *   SK: id (student id)
 *   Attributes: { name, points, (optional) schoolId }
 *
 * Behavior:
 *  - If ?schoolId is provided, return only rows with that schoolId (scan + filter for demo).
 *  - Else return full leaderboard per bucket, plus overallTop.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const TABLE = process.env.STORAGE_FUTUREPATHLEADERBOARDSDEMO_NAME;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Content-Type,Authorization,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
};

const BUCKETS = ['middleSchool', 'grade9', 'grade10', 'grade11', 'grade12'];

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return respond(204, '');
    }
    if (event.httpMethod !== 'GET') {
      return respond(405, { message: 'Method Not Allowed' });
    }
    if (!TABLE) {
      throw new Error('Missing env STORAGE_FUTUREPATHLEADERBOARDSDEMO_NAME');
    }

    const qs = event.queryStringParameters || {};
    const limit = toInt(qs.limit, 10);
    const schoolId = cleanStr(qs.schoolId);

    if (schoolId) {
      // Filter by schoolId (scan for demo). Build both overallTop and per-bucket slices.
      const all = await scanAll(TABLE, {
        FilterExpression: '#sid = :sid',
        ExpressionAttributeNames: { '#sid': 'schoolId' },
        ExpressionAttributeValues: { ':sid': schoolId },
        ProjectionExpression: '#b, #id, #name, #pts, #sid',
        ExpressionAttributeNamesAdditional: {
          '#b': 'bucket',
          '#id': 'id',
          '#name': 'name',
          '#pts': 'points',
        },
      });

      const normalized = all.map((x) => ({
        bucket: String(x.bucket),
        id: String(x.id),
        name: x.name,
        points: Number(x.points) || 0,
        schoolId: x.schoolId,
      }));

      const overallTop = [...normalized].sort((a, b) => b.points - a.points).slice(0, limit);

      const perBucket = {};
      for (const b of BUCKETS) {
        perBucket[b] = normalized
          .filter((r) => r.bucket === b)
          .sort((a, b) => b.points - a.points)
          .slice(0, limit);
      }

      return respond(200, {
        ...perBucket,
        overallTop,
        limit,
        schoolId,
      });
    }

    // --------- No schoolId: return full per-bucket + overallTop (like before) ----------
    const perBucket = {};
    let allRows = [];

    for (const bucket of BUCKETS) {
      const rows = await queryBucket(bucket);
      // normalize & sort desc by points
      const norm = rows
        .map((x) => ({
          bucket,
          id: String(x.id),
          name: x.name,
          points: Number(x.points) || 0,
          schoolId: x.schoolId,
        }))
        .sort((a, b) => b.points - a.points);
      perBucket[bucket] = norm.slice(0, limit);
      allRows = allRows.concat(norm);
    }

    const overallTop = [...allRows].sort((a, b) => b.points - a.points).slice(0, limit);

    return respond(200, {
      ...perBucket,
      overallTop,
      limit,
    });
  } catch (err) {
    console.error('ERROR', err);
    return respond(500, { message: err?.message || 'Internal server error' });
  }
};

// ---------------- helpers ----------------
function respond(code, body) {
  return {
    statusCode: code,
    headers: CORS,
    body: typeof body === 'string' ? body : JSON.stringify(body ?? {}),
  };
}
function toInt(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}
function cleanStr(s) {
  if (s == null) return null;
  const t = String(s).trim();
  return t.length ? t : null;
}

async function queryBucket(bucket) {
  // PK-only query (bucket as partition key)
  const out = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: '#b = :bucket',
      ExpressionAttributeNames: { '#b': 'bucket' },
      ExpressionAttributeValues: { ':bucket': bucket },
      ProjectionExpression: '#id, #name, #pts, #sid',
      ExpressionAttributeNamesAdditional: {
        '#id': 'id',
        '#name': 'name',
        '#pts': 'points',
        '#sid': 'schoolId',
      },
    })
  );
  // Dynamo v3 QueryCommand ignores the custom "ExpressionAttributeNamesAdditional" field—we merged that below:
  const items = (out?.Items || []).map((x) => x);
  return items;
}

async function scanAll(table, opts) {
  const ExpressionAttributeNames = {
    ...(opts.ExpressionAttributeNames || {}),
    ...(opts.ExpressionAttributeNamesAdditional || {}),
  };
  let items = [];
  let ExclusiveStartKey = undefined;
  do {
    const res = await ddb.send(
      new ScanCommand({
        TableName: table,
        FilterExpression: opts.FilterExpression,
        ExpressionAttributeValues: opts.ExpressionAttributeValues,
        ExpressionAttributeNames,
        ProjectionExpression: opts.ProjectionExpression,
        ExclusiveStartKey,
      })
    );
    items = items.concat(res.Items || []);
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

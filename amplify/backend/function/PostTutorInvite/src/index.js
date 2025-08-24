// amplify/backend/function/PostTutorInvite/src/index.js
"use strict";

const crypto = require("crypto");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const INVITES_TABLE = process.env.INVITES_TABLE || "";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function resp(status, body) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": CORS_ORIGIN,
      "Access-Control-Allow-Headers": "Authorization,Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    },
    body: JSON.stringify(body)
  };
}

function parseBody(event) {
  if (event && typeof event.body === "string") {
    try { return JSON.parse(event.body); } catch { return null; }
  }
  return event && event.body ? event.body : null;
}

function requireFields(obj, fields) {
  const missing = [];
  for (const f of fields) {
    if (!obj || obj[f] === undefined || obj[f] === null || obj[f] === "") missing.push(f);
  }
  return missing;
}

exports.handler = async (event) => {
  const method =
    (event.requestContext && event.requestContext.http && event.requestContext.http.method) ||
    event.httpMethod ||
    "POST";

  // CORS preflight
  if (method === "OPTIONS") return resp(204, {});
  if (method !== "POST") return resp(405, { message: "Method Not Allowed" });

  // Cognito claims (if authorizer attached)
  let claims = {};
  try {
    claims =
      (event.requestContext &&
        event.requestContext.authorizer &&
        event.requestContext.authorizer.jwt &&
        event.requestContext.authorizer.jwt.claims) ||
      {};
  } catch {}

  const input = parseBody(event);
  if (!input) return resp(400, { message: "Invalid JSON body" });

  const required = ["tutorId", "tutorName", "studentEmail", "studentName"];
  const missing = requireFields(input, required);
  if (missing.length) return resp(400, { message: "Missing required fields", missing });

  const inviteId = crypto.randomUUID();
  const now = new Date().toISOString();

  const item = {
    inviteId,
    tutorId: String(input.tutorId),
    tutorName: String(input.tutorName),
    studentEmail: String(input.studentEmail),
    studentName: String(input.studentName),
    parentEmail:
      input.parentEmail && String(input.parentEmail).trim().length > 0
        ? String(input.parentEmail)
        : null,
    createdAt: now,
    createdBySub: claims && claims.sub ? String(claims.sub) : null
  };

  try {
    if (INVITES_TABLE) {
      await ddb.send(
        new PutCommand({
          TableName: INVITES_TABLE,
          Item: item,
          ConditionExpression: "attribute_not_exists(inviteId)"
        })
      );
    }
    return resp(201, { invite: item });
  } catch (err) {
    console.error("PostTutorInvite error:", err);
    return resp(500, { message: "Failed to create invite", error: String(err && err.message ? err.message : err) });
  }
};

// lambdas/PostMentorInvite/index.js
"use strict";

const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
const { randomUUID } = require("crypto");

const INVITES_TABLE = process.env.INVITES_TABLE || ""; // optional
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

function resp(status, body) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": CORS_ORIGIN,
      "Access-Control-Allow-Headers": "Authorization,Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    },
    body: JSON.stringify(body),
  };
}

function parseBody(event) {
  if (event && typeof event.body === "string") {
    try {
      return JSON.parse(event.body);
    } catch (_) {
      return null;
    }
  }
  return event && event.body ? event.body : null;
}

function requireFields(obj, fields) {
  const missing = [];
  fields.forEach(function (f) {
    if (!obj || obj[f] === undefined || obj[f] === null || obj[f] === "") {
      missing.push(f);
    }
  });
  return missing;
}

exports.handler = async function (event) {
  const method =
    (event.requestContext &&
      event.requestContext.http &&
      event.requestContext.http.method) ||
    (event.httpMethod || "POST");

  if (method === "OPTIONS") return resp(204, {});

  if (method !== "POST") {
    return resp(405, { message: "Method Not Allowed" });
  }

  let claims = {};
  try {
    if (
      event.requestContext &&
      event.requestContext.authorizer &&
      event.requestContext.authorizer.jwt &&
      event.requestContext.authorizer.jwt.claims
    ) {
      claims = event.requestContext.authorizer.jwt.claims;
    }
  } catch (e) {
    // ignore
  }

  const input = parseBody(event);
  if (!input) {
    return resp(400, { message: "Invalid JSON body" });
  }

  const required = ["mentorId", "mentorName", "studentEmail", "studentName"];
  const missing = requireFields(input, required);
  if (missing.length > 0) {
    return resp(400, { message: "Missing required fields", missing });
  }

  const now = new Date().toISOString();
  const inviteId = randomUUID();

  const inviteItem = {
    inviteId: inviteId,
    mentorId: String(input.mentorId),
    mentorName: String(input.mentorName),
    studentEmail: String(input.studentEmail),
    studentName: String(input.studentName),
    parentEmail:
      input.parentEmail && String(input.parentEmail).trim().length > 0
        ? String(input.parentEmail)
        : null,
    createdAt: now,
    createdBySub: claims && claims.sub ? String(claims.sub) : null,
  };

  try {
    if (INVITES_TABLE) {
      await ddb
        .put({
          TableName: INVITES_TABLE,
          Item: inviteItem,
          ConditionExpression: "attribute_not_exists(inviteId)"
        })
        .promise();
    }

    // Optional: later you can send email via SES here.

    return resp(201, { invite: inviteItem });
  } catch (err) {
    console.error("PostMentorInvite error:", err);
    return resp(500, {
      message: "Failed to create invite",
      error: String(err && err.message ? err.message : err),
    });
  }
};

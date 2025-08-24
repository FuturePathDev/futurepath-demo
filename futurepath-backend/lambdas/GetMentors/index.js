// lambdas/GetMentors/index.js
"use strict";

const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

const MENTORS_TABLE = process.env.MENTORS_TABLE || ""; // optional
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Useful demo data if you haven't made a table yet
const DEFAULT_TUTORS = [
  {
    mentorId: "m-101",
    mentorName: "Dr. Priya Shah",
    subjects: ["Algebra", "Biology"],
    email: "priya@example.com",
  },
  {
    mentorId: "m-202",
    mentorName: "Marcus Lee",
    subjects: ["English", "History"],
    email: "marcus@example.com",
  },
];

function resp(status, body) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": CORS_ORIGIN,
      "Access-Control-Allow-Headers": "Authorization,Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async function (event) {
  // Handle CORS preflight if API CORS isn’t enabled
  const method =
    (event.requestContext &&
      event.requestContext.http &&
      event.requestContext.http.method) ||
    (event.httpMethod || "GET");
  if (method === "OPTIONS") return resp(204, {});

  // Claims (if Cognito authorizer is attached)
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

  try {
    if (!MENTORS_TABLE) {
      return resp(200, { items: DEFAULT_TUTORS });
    }

    const out = await ddb
      .scan({
        TableName: MENTORS_TABLE,
        Limit: 200,
      })
      .promise();

    const items = Array.isArray(out.Items) ? out.Items : [];
    return resp(200, { items });
  } catch (err) {
    console.error("GetMentors error:", err);
    return resp(500, {
      message: "Failed to fetch mentors",
      error: String(err && err.message ? err.message : err),
    });
  }
};

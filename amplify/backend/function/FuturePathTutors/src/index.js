"use strict";

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TUTORS_TABLE = process.env.TUTORS_TABLE || "";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const DEFAULT_TUTORS = [
  { tutorId: "t-101", tutorName: "Dr. Priya Shah", subjects: ["Algebra", "Biology"], email: "priya@example.com" },
  { tutorId: "t-202", tutorName: "Marcus Lee", subjects: ["English", "History"], email: "marcus@example.com" }
];

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

exports.handler = async (event) => {
  const method = (event.requestContext && event.requestContext.http && event.requestContext.http.method) || event.httpMethod || "GET";
  if (method === "OPTIONS") return resp(204, {});
  if (method !== "GET") return resp(405, { message: "Method Not Allowed" });

  try {
    if (!TUTORS_TABLE) return resp(200, { items: DEFAULT_TUTORS });

    const out = await ddb.send(new ScanCommand({ TableName: TUTORS_TABLE, Limit: 200 }));
    const items = Array.isArray(out.Items) ? out.Items : [];
    return resp(200, { items });
  } catch (err) {
    console.error("FuturePathTutors (Get) error:", err);
    return resp(500, { message: "Failed to fetch tutors", error: String(err && err.message ? err.message : err) });
  }
};

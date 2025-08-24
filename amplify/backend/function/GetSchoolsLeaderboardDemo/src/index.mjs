// index.mjs
// SchoolsLeaderboardDemo — GET /schools
// Reads the FuturePathSchoolsDemo table and returns top schools by engagement.
// Env provided by Amplify: STORAGE_FUTUREPATHSCHOOLSDEMO_NAME

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE = process.env.STORAGE_FUTUREPATHSCHOOLSDEMO_NAME;

// CORS for API Gateway
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "OPTIONS,GET",
};

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event) => {
  try {
    if (event?.httpMethod === "OPTIONS") {
      return respond(204, "");
    }
    if (!TABLE) throw new Error("Missing env STORAGE_FUTUREPATHSCHOOLSDEMO_NAME");

    switch (event?.httpMethod) {
      case "GET":
        return await handleGet(event);
      default:
        return respond(405, { message: "Method Not Allowed" });
    }
  } catch (err) {
    console.error("ERROR", err);
    return respond(500, { message: err?.message || "Internal server error" });
  }
};

function respond(statusCode, bodyObj) {
  return {
    statusCode,
    headers: CORS,
    body: typeof bodyObj === "string" ? bodyObj : JSON.stringify(bodyObj ?? {}),
  };
}

function num(n, fallback = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

async function scanAll() {
  const items = [];
  let ExclusiveStartKey;
  do {
    const out = await ddb.send(
      new ScanCommand({
        TableName: TABLE,
        ExclusiveStartKey,
      })
    );
    if (Array.isArray(out.Items)) items.push(...out.Items);
    ExclusiveStartKey = out.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

async function handleGet(event) {
  const q = event?.queryStringParameters || {};
  const limit = Math.max(1, Math.min(50, num(q.limit, 10))); // default 10, max 50
  const districtFilter = (q.district || "").trim();

  // read all (demo scale)
  const rows = await scanAll();

  // shape + filter + sanitize
  const schools = rows
    .map((r) => ({
      id: String(r.id ?? r.schoolId ?? ""),
      name: String(r.name ?? r.schoolName ?? "Unnamed School"),
      district: String(r.district ?? r.districtName ?? "Unknown District"),
      engagement: num(r.engagement, num(r.points, 0)),
    }))
    .filter((r) => r.id) // must have PK
    .filter((r) => (districtFilter ? r.district === districtFilter : true));

  // sort by engagement desc, then name
  schools.sort((a, b) => {
    if (b.engagement !== a.engagement) return b.engagement - a.engagement;
    return a.name.localeCompare(b.name);
  });

  const overallTop = schools.slice(0, limit);

  // group by district
  const byDistrict = {};
  for (const s of schools) {
    if (!byDistrict[s.district]) byDistrict[s.district] = [];
    byDistrict[s.district].push(s);
  }
  // cap each district list to limit and keep sorted
  Object.keys(byDistrict).forEach((d) => {
    byDistrict[d] = byDistrict[d].slice(0, limit);
  });

  return respond(200, {
    overallTop,
    byDistrict,
    total: schools.length,
    limit,
    ...(districtFilter ? { district: districtFilter } : {}),
  });
}

'use strict';

/**
 * GetParentsLeaderboardDemo
 * GET /leaderboard/parents
 *   ?limit=10
 *   ?district=Riverside%20USD
 *   ?schoolId=S-001
 *
 * Table: STORAGE_FUTUREPATHPARENTSLEADERBOARDDEMO_NAME
 *  - Example item: { id, name, district, points, schoolId? }
 *
 * Notes:
 *  - If schoolId is provided, we filter by schoolId.
 *  - If district is provided (and no schoolId), we filter by district.
 *  - Else we return all parents.
 *  - We avoid ProjectionExpression/Alias complexity to keep scans robust.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const PARENTS_TABLE = process.env.STORAGE_FUTUREPATHPARENTSLEADERBOARDDEMO_NAME;
// Optional schools table for future fallbacks (not required)
const SCHOOLS_TABLE = process.env.STORAGE_FUTUREPATHSCHOOLSDEMO_NAME;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
};

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return respond(204, '');
    }
    if (event.httpMethod !== 'GET') {
      return respond(405, { message: 'Method Not Allowed' });
    }
    if (!PARENTS_TABLE) {
      throw new Error('Missing env STORAGE_FUTUREPATHPARENTSLEADERBOARDDEMO_NAME');
    }

    const qs = event.queryStringParameters || {};
    const limit = toInt(qs.limit, 10);
    const district = clean(qs.district);
    const schoolId = clean(qs.schoolId);

    // ---- Build scan input (keep it simple & resilient) ----
    let scanInput = { TableName: PARENTS_TABLE };
    if (schoolId) {
      scanInput.FilterExpression = '#sid = :sid';
      scanInput.ExpressionAttributeNames = { '#sid': 'schoolId' };
      scanInput.ExpressionAttributeValues = { ':sid': schoolId };
    } else if (district) {
      scanInput.FilterExpression = '#dist = :d';
      scanInput.ExpressionAttributeNames = { '#dist': 'district' };
      scanInput.ExpressionAttributeValues = { ':d': district };
    }

    const parents = await scanAll(scanInput);

    const normalized = parents.map((p) => ({
      id: String(p.id ?? ''),
      name: p.name ?? '',
      district: p.district ?? '',
      points: Number(p.points) || 0,
      schoolId: p.schoolId ?? null,
    }));

    const overallTop = normalized.sort((a, b) => b.points - a.points);
    const payload = {
      overallTop: overallTop.slice(0, limit),
      total: overallTop.length,
      limit,
    };
    if (schoolId) payload.schoolId = schoolId;
    if (district) payload.district = district;

    return respond(200, payload);
  } catch (err) {
    console.error('PARENTS LB ERROR:', err);
    // Keep the external message generic, but log details above.
    return respond(500, { message: 'Internal server error' });
  }
};

// ------------- helpers -------------
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
function clean(s) {
  if (s == null) return null;
  const v = String(s).trim();
  return v ? v : null;
}

async function scanAll(input) {
  let items = [];
  let ExclusiveStartKey;
  do {
    const res = await ddb.send(new ScanCommand({ ...input, ExclusiveStartKey }));
    items = items.concat(res.Items || []);
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

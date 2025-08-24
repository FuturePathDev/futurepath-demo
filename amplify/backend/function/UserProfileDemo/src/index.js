'use strict';

/**
 * UserProfileDemo Lambda
 * - GET  /user            -> returns the caller's profile (by id/email/sub)
 *   query support: ?id=..., ?email=...
 * - POST /user            -> upsert profile (merge with existing)
 *
 * Enhancements (children):
 * - Accept children as array of strings or objects { email, name? }.
 * - Normalize children to objects, dedupe by email (case-insensitive).
 * - Merge names when the same email is posted again.
 *
 * Notes:
 * - Table name is injected by Amplify as STORAGE_FUTUREPATHUSERSDEMO_NAME
 * - Uses AWS SDK v3 (@aws-sdk/*).
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE = process.env.STORAGE_FUTUREPATHUSERSDEMO_NAME;
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
};

/* ----------------------------- Utilities ----------------------------- */

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

function isEmailLike(s) {
  return typeof s === 'string' && /\S+@\S+\.\S+/.test(s);
}

/** Convert one child entry (string or object) -> { email, name? } or null */
function toChildObject(x) {
  if (x == null) return null;
  if (typeof x === 'string') {
    const e = x.trim();
    if (!isEmailLike(e)) return null;
    return { email: e };
  }
  if (typeof x === 'object') {
    const e = String(x.email || '').trim();
    if (!isEmailLike(e)) return null;
    const name = x.name != null && String(x.name).trim() ? String(x.name).trim() : undefined;
    return name ? { email: e, name } : { email: e };
  }
  return null;
}

/** Normalize array of child entries */
function normalizeChildren(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  const seen = new Set();
  for (const raw of arr) {
    const obj = toChildObject(raw);
    if (!obj) continue;
    const key = obj.email.toLowerCase();
    if (seen.has(key)) {
      // Prefer the first non-empty name we see
      const idx = out.findIndex((c) => c.email.toLowerCase() === key);
      if (idx >= 0 && !out[idx].name && obj.name) out[idx].name = obj.name;
      continue;
    }
    seen.add(key);
    out.push({ ...obj });
  }
  return out;
}

/** Merge previous and new children by email (case-insensitive) */
function mergeChildren(prev, next) {
  const a = normalizeChildren(prev);
  const b = normalizeChildren(next);
  if (!a.length && !b.length) return [];

  const byEmail = new Map();
  for (const c of a) byEmail.set(c.email.toLowerCase(), { ...c });
  for (const c of b) {
    const key = c.email.toLowerCase();
    if (!byEmail.has(key)) {
      byEmail.set(key, { ...c });
    } else {
      const cur = byEmail.get(key);
      // keep existing name if present; otherwise use the new one
      if (!cur.name && c.name) cur.name = c.name;
    }
  }
  // deterministic ordering: by name (if any) then by email
  return Array.from(byEmail.values()).sort((x, y) => {
    const xn = (x.name || '').toLowerCase();
    const yn = (y.name || '').toLowerCase();
    if (xn !== yn) return xn.localeCompare(yn);
    return x.email.toLowerCase().localeCompare(y.email.toLowerCase());
  });
}

/** Build an ordered list of candidate keys we can try against the table. */
function buildCandidates({ query, body, claims }) {
  const out = [];
  const push = (attr, val, source) => {
    if (val != null && val !== '') out.push({ attr, value: String(val), source });
  };

  // explicit request
  push('id', query?.id, 'query.id');
  push('email', query?.email, 'query.email');

  // body (POST)
  push('id', body?.id, 'body.id');
  push('email', body?.email, 'body.email');
  push('userId', body?.userId, 'body.userId');

  // identity
  push('email', claims?.email, 'claims.email');
  push('sub', claims?.sub, 'claims.sub');
  push('id', claims?.['cognito:username'], 'claims.cognito:username');

  // de-dup by (attr,value) while keeping order
  const seen = new Set();
  return out.filter(({ attr, value }) => {
    const key = `${attr}::${value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getFirstExisting(candidates) {
  for (const c of candidates) {
    try {
      const res = await ddb.send(
        new GetCommand({ TableName: TABLE, Key: { [c.attr]: c.value } })
      );
      if (res?.Item) {
        return { item: res.Item, keyAttr: c.attr, keyValue: c.value, source: c.source };
      }
    } catch (e) {
      // ignore and continue
    }
  }
  return null;
}

/* ------------------------------- Handler ------------------------------ */

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: CORS, body: '' };
    }
    if (!TABLE) throw new Error('Missing env STORAGE_FUTUREPATHUSERSDEMO_NAME');

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

// ---------------------- GET /user ----------------------
async function handleGet(event) {
  const query = event?.queryStringParameters || {};
  const claims = getClaims(event);

  const candidates = buildCandidates({ query, body: null, claims });
  if (!candidates.length) {
    return respond(400, {
      message: 'Provide ?id= or ?email= (or authenticate so we can infer your identity).',
    });
  }

  const found = await getFirstExisting(candidates);
  if (!found) return respond(404, { message: 'User not found' });

  // If this profile has legacy string children, upgrade them on the fly in the response.
  const profile = { ...found.item };
  if (Array.isArray(profile.children)) {
    profile.children = normalizeChildren(profile.children);
  }

  return respond(200, { profile });
}

// ---------------------- POST /user ----------------------
async function handlePost(event) {
  const body = parseJSON(event.body);
  const query = event?.queryStringParameters || {};
  const claims = getClaims(event);

  // 1) Try to locate an existing profile
  const existingLookup = await getFirstExisting(buildCandidates({ query, body, claims }));

  // 2) Decide our primary key attribute/value for the write
  let keyAttr = null;
  let keyValue = null;

  if (body?.email) {
    keyAttr = 'email';
    keyValue = String(body.email);
  } else if (body?.id) {
    keyAttr = 'id';
    keyValue = String(body.id);
  } else if (existingLookup) {
    keyAttr = existingLookup.keyAttr;
    keyValue = existingLookup.keyValue;
  } else if (claims?.email) {
    keyAttr = 'email';
    keyValue = String(claims.email);
  } else if (claims?.sub) {
    keyAttr = 'sub';
    keyValue = String(claims.sub);
  } else {
    return respond(400, {
      message:
        'Cannot determine primary key. Include at least one of: { email, id } in the POST body.',
    });
  }

  const prev = existingLookup?.item || {};
  const now = new Date().toISOString();

  // We want special handling for children, so remove it before the shallow merge.
  const bodySansChildren = { ...body };
  delete bodySansChildren.children;

  const next = {
    ...prev,
    ...bodySansChildren,
    [keyAttr]: keyValue,
    updatedAt: now,
    createdAt: prev?.createdAt || now,
  };

  // Merge/normalize children if provided
  if (Array.isArray(body.children)) {
    next.children = mergeChildren(prev.children, body.children);
  } else if (Array.isArray(prev.children)) {
    // Always store normalized form even if caller didn't send children this time
    next.children = normalizeChildren(prev.children);
  }

  // 4) Put (idempotent upsert)
  await ddb.send(
    new PutCommand({
      TableName: TABLE,
      Item: next,
    })
  );

  return respond(200, { profile: next, keyAttr, keyValue });
}

// functions/FuturePathResourcesApi/index.mjs
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand,
  ScanCommand, QueryCommand
} from "@aws-sdk/lib-dynamodb";

// ---------- DDB + ENV ----------
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const RESOURCES_TABLE      = process.env.RESOURCES_TABLE;
const BOOKMARKS_TABLE      = process.env.BOOKMARKS_TABLE;
const MENTORS_TABLE        = process.env.MENTORS_TABLE;
const TUTORS_TABLE         = process.env.TUTORS_TABLE;
const ANNOUNCEMENTS_TABLE  = process.env.ANNOUNCEMENTS_TABLE;
const LEADERBOARDS_TABLE   = process.env.LEADERBOARDS_TABLE;
const USERS_TABLE          = process.env.USERS_TABLE;

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || "*";

// ---------- helpers ----------
const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-demo-user, x-user-id, X-Demo-User, X-User-Id",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  },
  body: typeof body === "string" ? body : JSON.stringify(body),
});

const getUserFromEvent = (event) => {
  const claims = event?.requestContext?.authorizer?.jwt?.claims || {};
  const h = event?.headers || {};
  const demo =
    h["x-demo-user"] || h["x-user-id"] ||
    h["X-Demo-User"] || h["X-User-Id"] || null;
  return {
    sub: claims.sub || demo,
    preferred: claims["preferred_username"] || claims["cognito:username"] || null,
    email: claims.email || null,
  };
};

// Normalize method + path and strip stage prefix (e.g. "/demo/resources" -> "/resources")
const getMethodAndPath = (event) => {
  const method = event?.requestContext?.http?.method || event?.httpMethod || "GET";
  const raw =
    event?.rawPath || event?.path || event?.requestContext?.resourcePath || "/";
  const stage = event?.requestContext?.stage;

  let path = String(raw || "/").replace(/\/{2,}/g, "/");
  if (stage && path === `/${stage}`) path = "/";
  else if (stage && path.startsWith(`/${stage}/`)) path = path.slice(stage.length + 1);

  return { method, path };
};

const parseBool = (v) => String(v).toLowerCase() === "true";
const parseList = (v) =>
  typeof v === "string"
    ? v.split(",").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(v) ? v : undefined;

const buildResourceFilter = (q) => {
  const names = {};
  const values = {};
  const expr = [];

  if (q.query) {
    names["#title"] = "title";
    names["#summary"] = "summary";
    values[":q"] = q.query;
    expr.push("(contains(#title, :q) OR contains(#summary, :q))");
  }

  const arrayContains = (field, list, alias) => {
    if (!list?.length) return;
    names[`#${alias}`] = field;
    const ors = [];
    list.forEach((v, i) => {
      const key = `:${alias}${i}`;
      values[key] = v;
      ors.push(`contains(#${alias}, ${key})`);
    });
    expr.push(`(${ors.join(" OR ")})`);
  };

  arrayContains("audience", q.audience, "audience");
  arrayContains("grades", q.grades, "grades");
  arrayContains("clusters", q.clusters, "clusters");
  arrayContains("riaSec", q.riaSec, "ria");
  arrayContains("formats", q.formats, "formats");
  arrayContains("language", q.language, "lang");

  if (q.maxDuration) {
    names["#durationMin"] = "durationMin";
    values[":maxDur"] = Number(q.maxDuration);
    expr.push("#durationMin <= :maxDur");
  }

  if (q.freeOnly) {
    names["#costType"] = "costType";
    values[":free"] = "Free";
    expr.push("#costType = :free");
  }

  const FilterExpression = expr.length ? expr.join(" AND ") : undefined;
  return {
    FilterExpression,
    ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
    ExpressionAttributeValues: Object.keys(values).length ? values : undefined,
  };
};

async function scanTable(TableName, Limit, nextToken, filterProps) {
  const data = await ddb.send(
    new ScanCommand({
      TableName,
      Limit,
      ExclusiveStartKey: nextToken ? JSON.parse(nextToken) : undefined,
      ...(filterProps || {}),
    })
  );
  return {
    items: data.Items || [],
    nextToken: data.LastEvaluatedKey
      ? JSON.stringify(data.LastEvaluatedKey)
      : null,
  };
}

// ---------- handler ----------
export const handler = async (event) => {
  try {
    const { method, path } = getMethodAndPath(event);
    const qs = event.queryStringParameters || {};
    const user = getUserFromEvent(event);

    // CORS preflight
    if (method === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, x-demo-user, x-user-id, X-Demo-User, X-User-Id",
          "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
        },
        body: "",
      };
    }

    // ---------- RESOURCES ----------
    if (method === "GET" && path === "/resources") {
      const pageSize = Math.min(parseInt(qs.limit || "30", 10), 60);
      const nextToken = qs.nextToken ? decodeURIComponent(qs.nextToken) : undefined;

      const filters = buildResourceFilter({
        query: qs.query,
        audience: parseList(qs.audience),
        grades: parseList(qs.grade || qs.grades),
        clusters: parseList(qs.cluster || qs.clusters),
        riaSec: parseList(qs.riaSec),
        formats: parseList(qs.format || qs.formats),
        language: parseList(qs.language),
        maxDuration: qs.maxDuration,
        freeOnly: parseBool(qs.freeOnly || "false"),
      });

      const data = await scanTable(RESOURCES_TABLE, pageSize, nextToken, filters);
      return json(200, {
        items: data.items,
        nextToken: data.nextToken ? encodeURIComponent(data.nextToken) : null,
      });
    }

    if (method === "GET" && path.startsWith("/resources/")) {
      const id = decodeURIComponent(path.split("/").pop());
      const data = await ddb.send(
        new GetCommand({ TableName: RESOURCES_TABLE, Key: { id } })
      );
      if (!data.Item) return json(404, { message: "Not found" });
      return json(200, data.Item);
    }

    // ---------- BOOKMARKS ----------
    if (method === "GET" && path === "/bookmarks") {
      if (!user?.sub) return json(401, { message: "Unauthorized" });
      const res = await ddb.send(
        new QueryCommand({
          TableName: BOOKMARKS_TABLE,
          KeyConditionExpression: "userId = :u",
          ExpressionAttributeValues: { ":u": user.sub },
        })
      );
      return json(200, { items: res.Items || [] });
    }

    if (method === "POST" && path === "/bookmarks") {
      if (!user?.sub) return json(401, { message: "Unauthorized" });
      const body = JSON.parse(event.body || "{}");
      if (!body.resourceId) return json(400, { message: "resourceId required" });
      const item = {
        userId: user.sub,
        resourceId: body.resourceId,
        createdAt: new Date().toISOString(),
      };
      await ddb.send(new PutCommand({ TableName: BOOKMARKS_TABLE, Item: item }));
      return json(200, item);
    }

    if (method === "DELETE" && path.startsWith("/bookmarks/")) {
      if (!user?.sub) return json(401, { message: "Unauthorized" });
      const id = decodeURIComponent(path.split("/").pop());
      await ddb.send(
        new DeleteCommand({
          TableName: BOOKMARKS_TABLE,
          Key: { userId: user.sub, resourceId: id },
        })
      );
      return { statusCode: 204, headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGINS }, body: "" };
    }

    // ---------- USER (for ProfileProvider) ----------
    if (method === "GET" && path === "/user") {
      const email = qs.email || user?.email;
      if (!email) return json(400, { message: "email required" });
      const res = await ddb.send(
        new GetCommand({ TableName: USERS_TABLE, Key: { email } })
      );
      return json(200, { profile: res.Item || null });
    }

    if (method === "POST" && path === "/user") {
      const body = JSON.parse(event.body || "{}");
      const email = body?.email || user?.email;
      if (!email) return json(400, { message: "email required" });
      const item = { ...body, email, updatedAt: new Date().toISOString() };
      await ddb.send(new PutCommand({ TableName: USERS_TABLE, Item: item }));
      return json(200, { profile: item });
    }

    // ---------- OPTIONAL READ-ONLY LISTS ----------
    if (method === "GET" && path === "/announcements") {
      const pageSize = Math.min(parseInt(qs.limit || "30", 10), 60);
      const nextToken = qs.nextToken ? decodeURIComponent(qs.nextToken) : undefined;
      const data = await scanTable(ANNOUNCEMENTS_TABLE, pageSize, nextToken);
      // Sort newest first if "date" exists
      const items = [...data.items].sort((a, b) =>
        String(b.date || "").localeCompare(String(a.date || ""))
      );
      return json(200, {
        items,
        nextToken: data.nextToken ? encodeURIComponent(data.nextToken) : null,
      });
    }

    if (method === "GET" && path === "/mentors") {
      const pageSize = Math.min(parseInt(qs.limit || "30", 10), 60);
      const nextToken = qs.nextToken ? decodeURIComponent(qs.nextToken) : undefined;

      const names = {};
      const vals = {};
      const ex = [];
      if (qs.query) {
        names["#name"] = "name";
        names["#title"] = "title";
        names["#org"] = "org";
        names["#email"] = "email";
        vals[":q"] = qs.query;
        ex.push("(contains(#name,:q) OR contains(#title,:q) OR contains(#org,:q) OR contains(#email,:q))");
      }
      const filters = ex.length
        ? { FilterExpression: ex.join(" AND "), ExpressionAttributeNames: names, ExpressionAttributeValues: vals }
        : undefined;

      const data = await scanTable(MENTORS_TABLE, pageSize, nextToken, filters);
      return json(200, {
        items: data.items,
        nextToken: data.nextToken ? encodeURIComponent(data.nextToken) : null,
      });
    }

    if (method === "GET" && path === "/tutors") {
      const pageSize = Math.min(parseInt(qs.limit || "30", 10), 60);
      const nextToken = qs.nextToken ? decodeURIComponent(qs.nextToken) : undefined;

      const names = {};
      const vals = {};
      const ex = [];
      if (qs.query) {
        names["#name"] = "name";
        names["#subject"] = "subject";
        names["#email"] = "email";
        vals[":q"] = qs.query;
        ex.push("(contains(#name,:q) OR contains(#subject,:q) OR contains(#email,:q))");
      }
      const filters = ex.length
        ? { FilterExpression: ex.join(" AND "), ExpressionAttributeNames: names, ExpressionAttributeValues: vals }
        : undefined;

      const data = await scanTable(TUTORS_TABLE, pageSize, nextToken, filters);
      return json(200, {
        items: data.items,
        nextToken: data.nextToken ? encodeURIComponent(data.nextToken) : null,
      });
    }

    if (method === "GET" && path === "/leaderboards") {
      const pageSize = Math.min(parseInt(qs.limit || "50", 10), 100);
      const nextToken = qs.nextToken ? decodeURIComponent(qs.nextToken) : undefined;
      const data = await scanTable(LEADERBOARDS_TABLE, pageSize, nextToken);
      return json(200, {
        items: data.items,
        nextToken: data.nextToken ? encodeURIComponent(data.nextToken) : null,
      });
    }

    // Fallback
    return json(404, { message: "Route not found", method, path });
  } catch (err) {
    console.error(err);
    return json(500, { message: "Server error", error: String(err?.message || err) });
  }
};

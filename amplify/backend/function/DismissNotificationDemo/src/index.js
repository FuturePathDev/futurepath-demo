const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE = process.env.STORAGE_FUTUREPATHNOTIFICATIONSDEMO_NAME;
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    if (!body.user || !body.id) {
      return { statusCode: 400, body: "user and id are required" };
    }
    await ddb.send(new DeleteCommand({
      TableName: TABLE,
      Key: { users: body.user, id: body.id }
    }));
    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json","Access-Control-Allow-Origin":"*" },
      body: JSON.stringify({ ok: true })
    };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};

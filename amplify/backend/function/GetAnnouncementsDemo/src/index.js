const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE = process.env.STORAGE_FUTUREPATHANNOUNCEMENTSDEMO_NAME;
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async () => {
  const data = await ddb.send(new ScanCommand({ TableName: TABLE, Limit: 50 }));
  const items = (data.Items || []).sort((a,b)=> (b.createdAt || "").localeCompare(a.createdAt || ""));
  return {
    statusCode: 200,
    headers: { "Content-Type":"application/json","Access-Control-Allow-Origin":"*" },
    body: JSON.stringify(items)
  };
};

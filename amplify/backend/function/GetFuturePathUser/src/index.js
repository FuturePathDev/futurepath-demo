const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  console.log("EVENT RECEIVED:", JSON.stringify(event));

  try {
    const userId = event.pathParameters?.userId;
    if (!userId) {
      console.error("Missing userId in path parameters.");
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing userId in path parameters." }),
      };
    }

    const params = {
      TableName: "FuturePathUsers",
      Key: {
        userId: { S: userId },
      },
    };

    console.log("DynamoDB Params:", JSON.stringify(params));

    const command = new GetItemCommand(params);
    const data = await client.send(command);

    console.log("DynamoDB Response:", JSON.stringify(data));

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };
  } catch (err) {
    console.error("Lambda error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

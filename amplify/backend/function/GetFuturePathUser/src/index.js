const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: process.env.REGION });

exports.handler = async (event) => {
    try {
        const userId = event.pathParameters?.userId;

        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing userId in path parameters." }),
            };
        }

        const params = {
            TableName: process.env.STORAGE_FUTUREPATHUSERS_NAME,
            Key: { userId: { S: userId } },
        };

        const command = new GetItemCommand(params);
        const data = await client.send(command);

        if (!data.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "User not found" }),
            };
        }

        const user = {
            userId: data.Item.userId.S,
            name: data.Item.name?.S || null,
            email: data.Item.email?.S || null,
            school: data.Item.school?.S || null,
            grade: data.Item.grade?.S || null,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(user),
        };
    } catch (err) {
        console.error("Lambda error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
};

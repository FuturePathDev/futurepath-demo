import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event));

    const userId = event.pathParameters?.userId;
    const method = event.httpMethod;
    const tableName = 'FuturePathUsers-dev';

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing userId' }),
        };
    }

    try {
        if (method === 'GET') {
            const result = await ddbDocClient.send(
                new GetCommand({
                    TableName: tableName,
                    Key: { userId },
                })
            );
            return {
                statusCode: 200,
                body: JSON.stringify([result.Item || {}]),
            };
        }

        if (method === 'PUT') {
            const body = JSON.parse(event.body);
            await ddbDocClient.send(
                new PutCommand({
                    TableName: tableName,
                    Item: body,
                })
            );
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true }),
            };
        }

        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    } catch (error) {
        console.error('Lambda Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

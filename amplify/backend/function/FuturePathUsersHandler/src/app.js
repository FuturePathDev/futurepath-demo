const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event));

    try {
        const userId = event.pathParameters.userId;
        const { name, age, school, district, careerPath } = JSON.parse(event.body);

        const params = {
            TableName: process.env.STORAGE_FUTUREPATHUSERS_NAME,
            Item: {
                userId,
                name,
                age,
                school,
                district,
                careerPath
            }
        };

        await ddbDocClient.send(new PutCommand(params));
        console.log('✅ User data saved to DynamoDB for userId:', userId);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "User data saved successfully!" })
        };
    } catch (error) {
        console.error('❌ Error saving user data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error." })
        };
    }
};

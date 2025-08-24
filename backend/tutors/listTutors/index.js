const AWS=require("aws-sdk");
const ddb=new AWS.DynamoDB.DocumentClient();
const T=process.env.TUTORS_TABLE;
exports.handler=async()=>({
  statusCode:200,
  headers:{
    "Content-Type":"application/json",
    "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"Authorization,Content-Type",
    "Access-Control-Allow-Methods":"GET,OPTIONS"
  },
  body:JSON.stringify({tutors:(await ddb.scan({TableName:T}).promise()).Items||[]})
});

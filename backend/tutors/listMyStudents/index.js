const AWS=require("aws-sdk");
const ddb=new AWS.DynamoDB.DocumentClient();
const A=process.env.ASSIGN_TABLE;
const ok=(c,b)=>({statusCode:c,headers:{
"Content-Type":"application/json",
"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"Authorization,Content-Type",
"Access-Control-Allow-Methods":"GET,OPTIONS"
},body:JSON.stringify(b)});
exports.handler=async(e)=>{
  if(e?.requestContext?.http?.method==="OPTIONS") return ok(200,{});
  const qs=e.queryStringParameters||{};
  const tutorId=qs.tutorId;
  if(!tutorId) return ok(400,{message:"tutorId required"});
  const q=await ddb.query({
    TableName:A,IndexName:"tutorId-index",
    KeyConditionExpression:"tutorId = :t",
    ExpressionAttributeValues:{":t":tutorId}
  }).promise();
  const students=(q.Items||[]).map(i=>({studentId:i.studentId,status:i.status,createdAt:i.createdAt}));
  return ok(200,{students});
};

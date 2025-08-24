const AWS=require("aws-sdk");
const ddb=new AWS.DynamoDB.DocumentClient();
const S=process.env.SESSIONS_TABLE;
const ok=(c,b)=>({statusCode:c,headers:{
"Content-Type":"application/json","Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"Authorization,Content-Type",
"Access-Control-Allow-Methods":"GET,OPTIONS"},body:JSON.stringify(b)});
exports.handler=async(e)=>{
  if(e?.requestContext?.http?.method==="OPTIONS") return ok(200,{});
  const qs=e.queryStringParameters||{}; const tutorId=qs.tutorId; const studentId=qs.studentId;
  if(tutorId){
    const r=await ddb.query({TableName:S,IndexName:"tutorId-index",KeyConditionExpression:"tutorId = :t",ExpressionAttributeValues:{":t":tutorId}}).promise();
    return ok(200,{sessions:r.Items||[]});
  }
  if(studentId){
    const r=await ddb.query({TableName:S,IndexName:"studentId-index",KeyConditionExpression:"studentId = :s",ExpressionAttributeValues:{":s":studentId}}).promise();
    return ok(200,{sessions:r.Items||[]});
  }
  return ok(400,{message:"tutorId or studentId required"});
};

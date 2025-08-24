const AWS=require("aws-sdk");
const {randomUUID}=require("crypto");
const ddb=new AWS.DynamoDB.DocumentClient();
const A=process.env.ASSIGN_TABLE; const S=process.env.SESSIONS_TABLE;
const ok=(c,b)=>({statusCode:c,headers:{
"Content-Type":"application/json","Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"Authorization,Content-Type",
"Access-Control-Allow-Methods":"POST,OPTIONS"},body:JSON.stringify(b)});
exports.handler=async(e)=>{
  if(e?.requestContext?.http?.method==="OPTIONS") return ok(200,{});
  const {tutorId,studentId,startIso,durationMin,meetingUrl} = JSON.parse(e.body||"{}");
  if(!tutorId||!studentId||!startIso||!durationMin) return ok(400,{message:"tutorId, studentId, startIso, durationMin required"});
  const q=await ddb.query({TableName:A,IndexName:"tutorId-index",KeyConditionExpression:"tutorId = :t",ExpressionAttributeValues:{":t":tutorId}}).promise();
  const allowed=(q.Items||[]).some(i=>i.studentId===studentId && i.status==="active");
  if(!allowed) return ok(403,{message:"No active assignment for this student"});
  const session={sessionId:randomUUID(),tutorId,studentId,startIso,durationMin:Number(durationMin),meetingUrl:meetingUrl||null,createdAt:new Date().toISOString()};
  await ddb.put({TableName:S,Item:session}).promise();
  return ok(200,{session});
};

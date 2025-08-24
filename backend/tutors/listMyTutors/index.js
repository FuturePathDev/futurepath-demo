const AWS=require("aws-sdk");
const ddb=new AWS.DynamoDB.DocumentClient();
const A=process.env.ASSIGN_TABLE;
const T=process.env.TUTORS_TABLE;
const ok=(c,b)=>({statusCode:c,headers:{
"Content-Type":"application/json",
"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"Authorization,Content-Type",
"Access-Control-Allow-Methods":"GET,OPTIONS"
},body:JSON.stringify(b)});
exports.handler=async(e)=>{
  if(e?.requestContext?.http?.method==="OPTIONS") return ok(200,{});
  const qs=e.queryStringParameters||{};
  const studentId=qs.studentId;
  if(!studentId) return ok(400,{message:"studentId required"});
  const q=await ddb.query({
    TableName:A,
    KeyConditionExpression:"studentId = :s",
    ExpressionAttributeValues:{":s":studentId}
  }).promise();
  const tutors=[];
  for(const a of (q.Items||[])){
    const g=await ddb.get({TableName:T,Key:{tutorId:a.tutorId}}).promise();
    if(g.Item) tutors.push(g.Item);
  }
  return ok(200,{tutors});
};

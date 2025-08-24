const AWS=require("aws-sdk");
const ddb=new AWS.DynamoDB.DocumentClient();
const A=process.env.ASSIGN_TABLE;
const ok=(c,b)=>({statusCode:c,headers:{
"Content-Type":"application/json",
"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"Authorization,Content-Type",
"Access-Control-Allow-Methods":"POST,OPTIONS"
},body:JSON.stringify(b)});
exports.handler=async(e)=>{
  if(e?.requestContext?.http?.method==="OPTIONS") return ok(200,{});
  let b={}; try{b=JSON.parse(e.body||"{}")}catch{}
  const {studentId,tutorId}=b;
  if(!studentId||!tutorId) return ok(400,{message:"studentId and tutorId required"});
  const now=new Date().toISOString();
  try{
    await ddb.put({
      TableName:A,
      Item:{studentId,tutorId,status:"active",createdAt:now},
      ConditionExpression:"attribute_not_exists(studentId) AND attribute_not_exists(tutorId)"
    }).promise();
  }catch(err){
    if(err.code!=="ConditionalCheckFailedException") throw err;
  }
  return ok(200,{assigned:true});
};

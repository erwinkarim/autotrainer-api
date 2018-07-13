import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  get modules belongs to courseId, otherwise, show all
*/
export async function main(event, context, callback) {
  //should check if current user can see all modules
  var params = {
    //show all
    TableName: "modules",
    KeyConditionExpression: "courseId = :courseId",
    ExpressionAttributeValues: {
      ":courseId": event.queryStringParameters.courseId,
      ":publish_status" : 'published'
    },
    FilterExpression: "publish_status = :publish_status",
    ExpressionAttributeNames: {'#o':'order'} ,
    ProjectionExpression: "courseId, moduleId, userId, moduleType, title, description, createdAt, #o, publish_status"
  };

  if(event.queryStringParameters.publish_status){
    if(event.queryStringParameters.publish_status === 'all'){
      //show all, works only if you own the modules
      //delete params.FilterExpression;
      params.FilterExpression = 'userId = :userId';
      delete params.ExpressionAttributeValues[':publish_status'];
      params.ExpressionAttributeValues[':userId'] = event.requestContext.identity.cognitoIdentityId;
    } else {
      params.ExpressionAttributeValues[':publish_status'] = event.queryStringParameters.publish_status
    };
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    // Return the matching list of items in response body
    callback(null, success(result.Items.sort((a,b) => a.order > b.order)));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

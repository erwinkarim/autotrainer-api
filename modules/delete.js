import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import update_module_counts from './libs/update_module_counts';

/*
  delete a module
*/
export async function main(event, context, callback) {
  const params = {
    TableName: "modules",
    Key: {
      courseId: event.queryStringParameters.courseId,
      moduleId: event.pathParameters.id
    },
    ConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const result = await dynamoDbLib.call("delete", params);
    //callback(null, success({ status: true }));
  } catch (e) {
    callback(null, failure({ status: false }));
  }

  try {
    //attemp to update module count in course
    await update_module_counts(event.queryStringParameters.courseId,
      event.requestContext.identity.cognitoIdentityId);

    // everything ok, call back
    callback(null, success({ status: true }));
    
  } catch(e){
    callback(null, failure({ status: false }));

  }

}

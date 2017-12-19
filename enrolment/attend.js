import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  update the record that userId has attend the class X of course Y
*/
export async function main(event, context, callback) {
  // 1. get the appropiate enrolment entry
  // 2. update the entry to append teh progress field if necessary
  var params = {
    TableName: "enrolment",
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      courseId: event.pathParameters.id
    }
  };
  var result = null;
  try{
    result = await dynamoDbLib.call("get", params);
  } catch(e){
    console.log('error getting course info');
    console.log(e);
    callback(null, failure({ status: false }));
  }

  // if the course has been attended, return true;
  if(!result.Item){
    callback(null, failure({ status: false }));
    return -1;
  }

  console.log('result.Item.progress', result.Item.progress);
  var classes = result.Item.progress;
  if(!classes.includes(event.pathParameters.moduleId)){
    console.log('push moduleId into classes');
    classes.push(event.pathParameters.moduleId);
  };

  console.log('classes', classes);
  // now append the progress field w/ the moduleId
  params = {
    TableName: "enrolment",
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      courseId: event.pathParameters.id
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET progress = :progress",
    ExpressionAttributeValues: {
      ":progress": classes
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    console.log('update new enrolment item');
    const result = await dynamoDbLib.call("update", params);
    callback(null, success({ status: true }));
  } catch (e) {
    console.log('failed to update progress');
    console.log(e)
    callback(null, failure({ status: false }));
  }
}

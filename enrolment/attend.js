import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import check_cert from './libs/check-cert.js';

/*
  update the record that userId has attend the class X of course Y
*/
export async function main(event, context, callback) {
  // 1. get the appropiate enrolment entry
  // 2. update the entry to append the progress field if necessary
  // 3. issue cert if all classes has been enrolled
  /*
    check if the user is enrolled in the course
   */
  console.log('checking enrolment');
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

  // user is not enrolled in the course, return failed
  if(!result.Item){
    callback(null, failure({ status: false }));
    return -1;
  }

  var classes = result.Item.progress;

  //check if the user attend the module, append when necessary
  if(classes.includes(event.pathParameters.moduleId)){
    console.log('user already attend module');
    callback(null, success({ status: true }));
    return 0;
  };

  //User hasn't attend, class, update
  console.log('push moduleId into classes');
  classes.push(event.pathParameters.moduleId);

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
    //callback(null, success({ status: true }));
  } catch (e) {
    console.log('failed to update progress');
    console.log(e)
    callback(null, failure({ status: false }));
  }

  //if all the modules in the course has been attended, issue attandance cert.
  try {
    const checkResult = await check_cert(event.requestContext.identity.cognitoIdentityId, event.pathParameters.id);
    if(checkResult === 0){
      callback(null, success({ status: checkResult, message:'New certificate issued' }));
    } else {
      callback(null, success({ status: checkResult }));

    }
  } catch(e){
    console.log('failed to check cert');
    console.log(e);
    callback(null, failure({ status: false }));
  }

}

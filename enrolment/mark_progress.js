import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  function to mark a modules progress
  (ie, what questions that has been answered, how far in the video ,etc)
*/
export async function main(event, context, callback) {
  // get current enrolment status w/ progress
  const attendance = {
    TableName: "enrolment",
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      courseId: event.pathParameters.id
    }
  };

  var result = null;
  try {
    //console.log('attempt getting current enrolment');
    result = await dynamoDbLib.call("get", attendance);

    //return error if enrolment record is not found
    if(!result.Item){
      callback(null, failure({ status: false, error: "Enrolment record not found." }));
    };

  } catch(e){
    console.log('error getting enrolment');
    console.log(e);
    callback(null, failure({ status: false }));
  }

  var enrolment_status = result.Item;
  var moduleId = event.pathParameters.moduleId;

  //console.log('event.body', event.body);

  if(enrolment_status.progress_detail){

    // find the current progress
    var current_progress = enrolment_status.progress_detail.find(
      (e) => Object.keys(e)[0] === event.pathParameters.moduleId );

    // update or push a new one
    if(current_progress !== undefined){
      current_progress[moduleId] = event.body;
    } else {
      var obj = {};
      obj[moduleId] = event.body;
      enrolment_status.progress_detail.push(obj);
    }

  } else {
    // create a new progress if there's nothing in it
    var obj = {};
    obj[moduleId] = event.body;
    enrolment_status.progress_detail = [obj];
  }

  //upload to dynamodb
  const updatedProgress = {
    TableName: 'enrolment',
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      courseId: event.pathParameters.id
    },
    UpdateExpression: "SET progress_detail = :progress_detail",
    ExpressionAttributeValues: {
      ":progress_detail": enrolment_status.progress_detail
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    //console.log('attemp to update enrolment progress');
    const result = await dynamoDbLib.call('update', updatedProgress);
    callback(null, success(result.Attributes) );

  } catch(e){
    console.log('error updating current progress');
    console.log(e);
    callback(null, failure({ status: false }));
  }
};

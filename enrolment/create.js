import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  enrol a user into the course
  TODO: handle enrollment when you already invited.
    plan: convert username into userId
*/
export async function main(event, context, callback) {
  const data = JSON.parse(event.body);

  //if email context, find the current enrolment and update that instead
  if(data.enrolmentContext){
    if(data.enrolmentContext === 'email'){
      //find the current enrolment record
      //if found, update to current user id
      //if not found, ignore this and let it create a new enrolment record

    };
  };

  const params = {
    TableName: "enrolment",
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      courseId: data.courseId,
      createdAt: new Date().getTime(),
      progress: [],
      status: 'enrolled'
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    callback(null, success(params.Item));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

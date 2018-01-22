import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import update_module_counts from './libs/update_module_counts';

/*
  TODO: update module counts in the course table
  TODO: update module counts put in a seprate library to call back
*/
export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "modules",
    Item: {
      courseId: data.courseId,
      moduleId: uuid.v1(),
      userId: event.requestContext.identity.cognitoIdentityId,
      title: data.title,
      description: data.description,
      moduleType: data.moduleType,
      order: parseInt(data.order, 10),
      publish_status: 'unpublished',
      createdAt: new Date().getTime()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    // do some course count processing first
    //callback(null, success(params.Item));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }

  console.log('attempt to update module count');
  update_module_counts(data.courseId, event.requestContext.identity.cognitoIdentityId);

  //everything went well
  callback(null, success(params.Item));
}

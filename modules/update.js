import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import update_module_counts from './libs/update_module_counts';

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "modules",
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      courseId: event.queryStringParameters.courseId,
      moduleId: event.pathParameters.id
    },
    ConditionExpression: "userId = :userId",
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: `SET title = :title, description = :description, body = :body, #o = :order, publish_status = :publish_status`,
    ExpressionAttributeValues: {
      ":title": data.title ? data.title : null,
      ":description": data.description ? data.description : null,
      ":body": data.body ? data.body : null,
      ":userId": event.requestContext.identity.cognitoIdentityId,
      ":order": parseInt(data.order,10),
      ":publish_status" : data.publish_status ? data.publish_status : 'unpublished'
    },
    ExpressionAttributeNames: {
      '#o': 'order'
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    //console.log('attempt to update module');
    const result = await dynamoDbLib.call("update", params);
    //callback(null, success({ status: true }));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }

  /*
    TODO: update module counts if the publish_status is published
  */
  //console.log('attempt to update module count');
  try {
    update_module_counts(
      event.queryStringParameters.courseId,
      event.requestContext.identity.cognitoIdentityId);
    callback(null, success({ status: true }));
  } catch(e){
    console.log('error update module count');
    console.error(e);
  }

}

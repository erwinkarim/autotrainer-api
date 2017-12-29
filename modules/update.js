import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

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
    UpdateExpression: "SET title = :title, description = :description, body = :body, #o = :order",
    ExpressionAttributeValues: {
      ":title": data.title ? data.title : null,
      ":description": data.description ? data.description : null,
      ":body": data.body ? data.body : null,
      ":userId": event.requestContext.identity.cognitoIdentityId,
      ":order": parseInt(data.order,10)
    },
    ExpressionAttributeNames: {
      '#o': 'order'
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoDbLib.call("update", params);
    callback(null, success({ status: true }));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

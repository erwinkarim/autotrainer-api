import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "courses",
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      courseId: event.pathParameters.id
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET #n = :name, description = :description, #s = :status, picture = :picture, price = :price ",
    ExpressionAttributeValues: {
      ":name" : data.name ? data.name : null,
      ":description" : data.description ? data.description : null,
      ":status" : data.status ? data.status : null,
      ":picture": data.picture ? data.picture : null,
      ":price" : data.price ? data.price : null
    },
    ExpressionAttributeNames: {
      '#n':'name',
      '#s':'status'
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

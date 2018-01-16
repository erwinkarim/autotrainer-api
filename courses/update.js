import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  /*
    TODO: set where only owners and admins can update / delete records
  */
  const params = {
    TableName: "courses",
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      courseId: event.pathParameters.id
      //userId: event.requestContext.identity.cognitoIdentityId
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET #n = :name, tagline = :tagline, description = :description, #s = :status, picture = :picture, price = :price, key_points = :key_points",
    ConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":name" : data.name ? data.name : null,
      ":tagline" : data.tagline ? data.tagline : null,
      ":description" : data.description ? data.description : null,
      ":status" : data.status ? data.status : 'unpublished',
      ":picture": data.picture ? data.picture : null,
      ":price" : data.price ? data.price : null,
      ":key_points": data.key_points ? data.key_points : null,
      ":userId": event.requestContext.identity.cognitoIdentityId
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

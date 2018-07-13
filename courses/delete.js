import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  TODO, should also delete associate course in a transaction
        or apply a trigger to course table on deletion event
*/
export async function main(event, context, callback) {
  const params = {
    TableName: "courses",
    // 'Key' defines the partition key and sort key of the item to be removed
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'courseId': path parameter
    Key: {
      courseId: event.pathParameters.id
    },
    ConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const result = await dynamoDbLib.call("delete", params);
    callback(null, success({ status: true }));
  } catch (e) {
    callback(null, failure({ status: false }));
  }
}

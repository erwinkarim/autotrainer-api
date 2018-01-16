
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  shows courses own by userId,
  TODO: load meta data for each course, quiz q count
*/
export async function main(event, context, callback) {
  //user owned courses
  const params = {
    TableName: "courses",
    IndexName: 'userId-courseId-index',
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    // Return the matching list of items in response body
    callback(null, success(result.Items));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }

  // load meta data for modules (quiz questions for each course)
}

import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import AWS from 'aws-sdk';

/*
  show the users that is enrolled in a courseId
  TODO: somehow contact cognito federated identity, and gleam user id from there
*/
export async function main(event, context, callback) {
  const params = {
    TableName: "enrolment",
    IndexName: 'courseId-index',
    // 'KeyConditionExpression' defines the condition for the query
    // - 'userId = :userId': only return items with matching 'userId'
    //   partition key
    // 'ExpressionAttributeValues' defines the value in the condition
    // - ':userId': defines 'userId' to be Identity Pool identity id
    //   of the authenticated user
    KeyConditionExpression: "courseId = :courseId",
    ExpressionAttributeValues: {
      ":courseId": event.pathParameters.id
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    // Return the matching list of items in response body
    if(result.Items.length > 0){
      console.log('asking cognto identity pool for more info');
      //should get further user info, like name, email, etc

      const ident = new AWS.CognitoIdentity({region:'ap-southeast-1'});
    };
    callback(null, success(result.Items));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

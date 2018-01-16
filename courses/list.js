import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  get recent courses
*/
export async function main(event, context, callback) {
  var params = {
    TableName: "courses",
    FilterExpression: "#s =  :s",
    ExpressionAttributeValues: {
      ":s": 'published'
    },
    ExpressionAttributeNames: {
      '#s': 'status'
    },
    Limit: 20
  };
  var result = null;

  try {
    result = await dynamoDbLib.call("scan", params);
    // Return the matching list of items in response body
    //callback(null, success(result.Items));
  } catch (e) {
    console.log('error scanning courses');
    console.log(e);
    callback(null, failure({ status: false }));
    return;
  }

  // get current enrolled courses
  var enrolledCoursesParams = {
    TableName: 'enrolment',
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  var enrolledCoursesResults = null;
  try{
    enrolledCoursesResults = await dynamoDbLib.call('query', enrolledCoursesParams);
    result.Items["enrolled"] = enrolledCoursesResults;
    callback(null, success(result.Items));
  } catch(e){
    callback(null, failure({ status: false }));
  }
}

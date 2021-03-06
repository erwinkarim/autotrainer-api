import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  get recent courses
*/
export async function main(event, context, callback) {
  var show_mode = 'published'
  //process keys is applicable
  if(event.queryStringParameters){
    if(event.queryStringParameters.show_mode){
      //TODO: check if this user allowed to view everything
      show_mode = event.queryStringParameters.show_mode;
    }
  }

  const params = show_mode === 'all' ? {
    TableName: "courses",
    Limit: 20
  } : {
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

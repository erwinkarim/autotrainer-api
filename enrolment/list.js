import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  list all courses attended by a particular user
  TODO: get enrolled courses info (title, etc
  TODO: get total modules for each course
  TODO: handle issues when some of the courses enrolled no longer exists
*/
export async function main(event, context, callback) {
  //get courses that is enrolled
  const params = {
    TableName: "enrolment",
    // 'KeyConditionExpression' defines the condition for the query
    // - 'userId = :userId': only return items with matching 'userId'
    //   partition key
    // 'ExpressionAttributeValues' defines the value in the condition
    // - ':userId': defines 'userId' to be Identity Pool identity id
    //   of the authenticated user
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  var result = null
  try {
    result = await dynamoDbLib.call("query", params);
    //console.log('result', result.Items);
    // return the results if it's empty
    if(result.Items.length === 0){
      callback(null, success(result.Items));
      return;
    }
    // Return the matching list of items in response body
    //callback(null, success(result.Items));
  } catch (e) {
    console.log('failure to get enrolment');
    console.log(e)
    callback(null, failure({ status: false }));
    return;
  }

  // get list of courseIds based on enrolment
  var courseIds = result.Items.map( (e,i) => { return { courseId:e.courseId}; });

  //get course title, based on enrolment
  const courseTitleParams = {
    RequestItems: {
      "courses" : {
        Keys: courseIds,
        ExpressionAttributeNames: {"#name": "name"},
        ProjectionExpression: "courseId, #name, moduleCount, publishedModuleCount",
      }
    }
  };

  var result2 = null;

  try {
    result2 = await dynamoDbLib.call('batchGet', courseTitleParams);
    //console.log('result2', result2.Responses.courses);
    result.Items.map( (c, i) => {
      var courseHandle = result2.Responses.courses.find( (e => e.courseId === c.courseId));
      if(courseHandle){
        c["name"] = courseHandle["name"];
        c["moduleCount"] = courseHandle["moduleCount"];
        c["publishedModuleCount"] = courseHandle["publishedModuleCount"];
      };
    });
    callback(null, success(result.Items));
  } catch (e){
    console.log(e);
    callback(null, failure({status: false}));
    return;

  }
}

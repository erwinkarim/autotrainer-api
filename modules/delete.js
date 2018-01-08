import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  delete a module
*/
export async function main(event, context, callback) {
  const params = {
    TableName: "modules",
    Key: {
      courseId: event.queryStringParameters.courseId,
      moduleId: event.pathParameters.id
    },
    ConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const result = await dynamoDbLib.call("delete", params);
    //callback(null, success({ status: true }));
  } catch (e) {
    callback(null, failure({ status: false }));
  }

  //attemp to update module count in course
  var countParams = {
    TableName: "modules",
    KeyConditionExpression: 'courseId = :courseId',
    ExpressionAttributeValues: {
      ':courseId': event.queryStringParameters.courseId,
    },
    ProjectionExpression: "courseId, moduleId",
    select: 'COUNT'
  };

  try {
    console.log('attemp to get module count');
    var result = await dynamoDbLib.call('query', countParams);
    var moduleCount = result.Count;

    countParams = {
      TableName: "courses",
      Key: {
        courseId: event.queryStringParameters.courseId,
      },
      UpdateExpression: "SET moduleCount = :moduleCount",
      ConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":moduleCount" : moduleCount,
        ":userId": event.requestContext.identity.cognitoIdentityId
      },
      ReturnValues: "ALL_NEW"
    }

    //update course count
    console.log(`attemp to update course count with value ${moduleCount}`);
    result = await dynamoDbLib.call('update', countParams);
    // now, call back
    callback(null, success({ status: true }));

  } catch(e){
    console.log('error getting module count');
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

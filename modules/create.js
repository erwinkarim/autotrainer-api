import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  TODO: update module counts in the course table
*/
export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "modules",
    Item: {
      courseId: data.courseId,
      moduleId: uuid.v1(),
      userId: event.requestContext.identity.cognitoIdentityId,
      title: data.title,
      description: data.description,
      moduleType: data.moduleType,
      order: parseInt(data.order, 10),
      createdAt: new Date().getTime()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    // do some course count processing first
    //callback(null, success(params.Item));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }

  //update module count in course table
  var countParams = {
    TableName: "modules",
    KeyConditionExpression: 'courseId = :courseId',
    ExpressionAttributeValues: {
      ':courseId': data.courseId
    },
    ProjectionExpression: "courseId, moduleId",
    select: 'COUNT'
  };

  try {
    //console.log('attemp to get module count');
    var result = await dynamoDbLib.call('query', countParams);
    var moduleCount = result.Count;


    countParams = {
      TableName: "courses",
      Key: {
        courseId: data.courseId
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
    //console.log(`attemp to update course count with value ${moduleCount}`);
    result = await dynamoDbLib.call('update', countParams);
    // now give back the new module
    callback(null, success(params.Item));

  } catch(e){
    console.log('error getting module count');
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

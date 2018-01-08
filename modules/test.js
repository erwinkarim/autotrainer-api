
import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  test function to go test queries
*/
export async function main(event, context, callback) {
  console.log('test');
  const params = {
    TableName: "modules",
    // 'Key' defines the partition key and sort key of the item to be retrieved
    // - 'noteId': path parameter
    KeyConditionExpression: 'courseId = :courseId',
    ExpressionAttributeValues: {
      ':courseId': '786e34c0-de39-11e7-918c-73a3bea17614'
    },
    ProjectionExpression: "courseId, moduleId",
    select: 'COUNT'
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    console.log('result', result);
    callback(null, success(result.Item));
  } catch(e){
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

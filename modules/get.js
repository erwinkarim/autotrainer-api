import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  get the specific module moduleId of courseId
*/
export async function main(event, context, callback) {
  const params = {
    TableName: "modules",
    Key: {
      courseId: event.queryStringParameters.courseId,
      moduleId: event.pathParameters.id
    }
  };

  // TODO: some meta info about the course we in, if required
  const courseMetaParams = {
    TableName: 'courses',
    Key: {
      courseId: event.queryStringParameters.courseId
    },
    ExpressionAttributeNames: { '#n':'name' },
    ProjectionExpression: "courseId, #n, moduleCount"
  };

  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      // Add course Meta when required
      const metaResult = await dynamoDbLib.call('get', courseMetaParams);
      result.Item.courseMeta = metaResult.Item;

      // Return the retrieved item
      callback(null, success(result.Item));
    } else {
      callback(null, failure({ status: false, error: "Item not found." }));
    }
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

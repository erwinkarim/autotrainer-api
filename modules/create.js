import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

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
    callback(null, success(params.Item));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

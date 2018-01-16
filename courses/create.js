import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  const params = {
    TableName: "courses",
    Item: {
      courseId: uuid.v1(),
      userId: event.requestContext.identity.cognitoIdentityId,
      name: data.name,
      description: data.description,
      status: 'unpublished',
      moduleCount: 0,
      //these two will be added at patch stage
      //picture: '',
      price: 39.99,
      createdAt: new Date().getTime()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    callback(null, success(params.Item));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  };

}

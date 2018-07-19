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
      title_font_color: 'black',
      //these will be added at patch stage
      // picture: '',
      // bg_pic, bg_pic_data
      // coupons
      price: 39.99,
      createdAt: new Date().getTime(),
      courseOptions: {},
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

/*
  API call to find the cert
*/
import { success, failure } from "./libs/response-lib";
import * as dynamoDbLib from "./libs/dynamodb-lib";


export async function main(event, context, callback) {
  //go find that cert
  const params = {
    TableName: "enrolment",
    IndexName: "certId-index",
    KeyConditionExpression: "certId = :certId",
    ExpressionAttributeValues: {
      ":certId": event.queryStringParameters.certId
    }
  }

  console.log('params', params);

  //cert look up
  try {
    var result = await dynamoDbLib.call('query', params);
    if(result.Items){
      callback(null, success(result.Items[0]));
    } else {
      callback(null, failure({ status: false, error: "Item not found." }));
    };
    return;
  } catch(e){
    console.log('error executing query');
    console.log(e);
    callback(null, failure({ status: false }));

  }

}

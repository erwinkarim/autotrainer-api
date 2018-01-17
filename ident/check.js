import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  function to
  1. check if identity id is in the ident table
  2. add identityId and username pair in the ident table
*/


export async function main(event, context, callback) {
  //check if the queryStringParameters exists w/ the right params
  if( !event.queryStringParameters || !event.queryStringParameters.username ){
    console.log('incorrect queryStringParameters config');
    callback(null, failure({ status: false }));
    return;
  };

  const params = {
    TableName:'identLookUp',
    Key: {
      identityId: event.requestContext.identity.cognitoIdentityId
    }
  };

  var result = null;
  try{
    result = await dynamoDbLib.call('get', params);
  } catch(e){
    console.log('error querying table ... ')
    console.log(e);
    callback(null, failure({ status: false }));
  };

  //nothing found
  if(!result.Item){
    const createParams = {
      TableName: 'identLookUp',
      Item: {
        identityId: event.requestContext.identity.cognitoIdentityId,
        username: event.queryStringParameters.username
      }
    };

    try {
      result = await dynamoDbLib.call('put', createParams);
      callback(null, success(createParams.Item));
      return;
    } catch(e){
      console.log('error updating table');
      callback(null, failure({ status: false }));
      return;
    };

  };

  //something found
  callback(null, success(result.Item));
}


/*
  returns a promise about user lookup
*/
import AWS from 'aws-sdk';
import * as dynamoDbLib from "./dynamodb-lib";

export default async function userLookup(identityId){
  const identSrv = new AWS.CognitoIdentityServiceProvider({region:'ap-southeast-1'});
  const userPoolId = 'ap-southeast-1_SDZuB7De0';

  const lookupParams = {
    TableName: 'identLookUp',
    Key:{
      identityId: identityId
    }
  }

  var result = null;
  var username = null;
  try {
    result = await dynamoDbLib.call('get', lookupParams);
    console.log('result', result);

    if(!result.Item){
      console.log('identity not found');
      return Promise.reject();
    }
  } catch(e){
    console.log('error lookuping up identity');
    return Promise.reject(e);
  }

  return identSrv.adminGetUser({ UserPoolId:userPoolId, Username: result.Item.username}, (err,data) => {
    if(err){
      console.log(`error looking up ${identityId}`);
    } else {
      return Promise.resolve(data);
    }
  }).promise();
}

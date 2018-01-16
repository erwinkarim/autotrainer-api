
import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import AWS from 'aws-sdk';

/*
  test function to go test queries
*/
export async function main(event, context, callback) {
  //attemp to get cognito attributes from given identityId
  const identityId = 'ap-southeast-1:945370c4-985b-470a-8a56-562a257d6129';
  const identityPoolId = 'ap-southeast-1:d305ce7d-b107-480b-93cd-a4c0c9881a42';
  const userPoolId = 'ap-southeast-1_SDZuB7De0';
  const clientId = '1pdpd2tbujfndf8fbb4udmh301';
  const userName = 'Google_113291405746651466763';
  const identSrv = new AWS.CognitoIdentityServiceProvider({region:'ap-southeast-1'});
  //const identSrv = new AWS.CognitoIdentity({region:'ap-southeast-1'});
  console.log('context dump');
  console.log(context);

  console.log('event.requestContext.identity dump:');
  console.log(event.requestContext.identity);

  callback(null, success({ status:true }));
  /*
  // grabs user data from cognito username
  // identSrv = new AWS.CognitoIdentityServiceProvider({region:'ap-southeast-1'});
  identSrv.adminGetUser(params, (err, data) => {
    if(err){
      console.log('error getting data');
      console.log(err);
    } else {
      console.log('data', data);
    }

  })
  */

  /*
  const params = {
    IdentityId: identityId
  };

  //const identSrv = new AWS.CognitoIdentity({region:'ap-southeast-1'});
  identSrv.describeIdentity(params, (err, data) => {
    if(err){
      console.log('error getting id');
      console.log(err);
    } else {
      console.log('data', data);
    }
  })
  { IdentityId: 'ap-southeast-1:945370c4-985b-470a-8a56-562a257d6129', Logins: [ 'accounts.google.com' ],
  CreationDate: 2017-11-23T00:29:29.915Z, LastModifiedDate: 2017-11-23T00:29:29.935Z }
  */

}

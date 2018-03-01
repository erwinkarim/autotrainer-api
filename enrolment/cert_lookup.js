/*
  API call to find the cert
*/
import { success, failure } from "./libs/response-lib";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import AWS from 'aws-sdk';


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

  //console.log('params', params);

  //cert look up
  var cert = null;
  var result = null;
  try {
    result = await dynamoDbLib.call('query', params);
    //console.log('result.Items', result.Items);
    if(result.Items.length > 0){
      //callback(null, success(result.Items[0]));
      cert = result.Items[0];
    } else {
      callback(null, failure({ status: false, error: "Item not found." }));
      return;
    };

  } catch(e){
    console.log('error executing query');
    console.log(e);
    callback(null, failure({ status: false }));
    return;
  }

  //get additional info (username, coursename, etc ...)
  const infoParams = {
    RequestItems: {
      'courses': {
        Keys: [{ courseId: cert.courseId}]
      },
      'identLookUp': {
        Keys: [{ identityId: cert.userId }]
      }
    }
  };


  try {
    result = await dynamoDbLib.call('batchGet', infoParams);
    cert.coursename = result.Responses.courses[0].name;
    cert.username = result.Responses.identLookUp[0].username;

    //callback(null, success(cert));

  } catch(e){
    console.log('error getting additional info');
    console.log(e);
    callback(null, failure({ status: false }));
    return;
  }

  //get actual name from the username
  const identSrv = new AWS.CognitoIdentityServiceProvider({region:'ap-southeast-1'});
  const userPoolId = 'ap-southeast-1_SDZuB7De0';

  try{
    //the call back is not being waited, have to do a 1-second sleep timer for now
    //get actual name
    var getUserFn = new Promise( (resolve,reject) => {
      identSrv.adminGetUser({ UserPoolId:userPoolId, Username: cert.username}, (err,data) => {
        if(err){
          console.log('error looking up', cert);
          console.error(err)
        } else {
          cert.actualname = data.UserAttributes.find( (elm) => elm.Name === 'name' ).Value;
          //console.log('cert.actualname', cert.actualname);
          resolve();
        };
      });
    })

    //now actually drop the cert after callback completed
    getUserFn.then( () => {
      callback(null, success(cert));
    });

  } catch(e){
    console.log('error retriving user info');
    console.log(e);
    return;
  }


}

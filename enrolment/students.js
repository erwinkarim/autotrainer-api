import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import AWS from 'aws-sdk';

/*
  show the users that is enrolled in a courseId
*/
export async function main(event, context, callback) {
  const params = {
    TableName: "enrolment",
    IndexName: 'courseId-index',
    KeyConditionExpression: "courseId = :courseId",
    ExpressionAttributeValues: {
      ":courseId": event.pathParameters.id
    }
  };

  var result = null;
  try {
    result = await dynamoDbLib.call("query", params);
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }

  //should get meta info
  try {
    await updateMeta(result)
    //console.log('updateMeta done');

    callback(null, success( result.Items ) );
  } catch(e){
    console.log('error getting meta info')
    console.log(e);
    callback(null, failure({ status: false }));
  }

};

/*
  get the username, should be blocking, return a promise
*/
async function updateMeta(result){
  if(result.Items.length === 0){
    return null;
  };

  //console.log('asking cognto identity pool for more info');
  //should get further user info, like name, email, etc
  const userQueryParams = {
    RequestItems: {
      'identLookUp': {
        Keys: result.Items.map( (e,i) => {return {identityId:e.userId};} )
      }
    }
  }

  //attempt to retrieve user id
  var userQueryResults = null;
  try{
    //console.log('attempt to get username from identityId');
    userQueryResults = await dynamoDbLib.call('batchGet', userQueryParams);

    //update the result
    const identSrv = new AWS.CognitoIdentityServiceProvider({region:'ap-southeast-1'});
    const userPoolId = 'ap-southeast-1_SDZuB7De0';
    return new Promise( (resolve, reject) => {
      var lookupPromises = [];
      userQueryResults.Responses.identLookUp.forEach( (elm) => {
        var item = result.Items.find( (e) => { return e.userId === elm.identityId; });
        item['username'] = elm.username;
        //console.log(`looking up ${elm.username} from ${elm.identityId}`)
        lookupPromises.push(
          identSrv.adminGetUser({ UserPoolId:userPoolId, Username: elm.username}, (err,data) => {
            if(err){
              console.log(`error looking up ${elm.username}`);
            } else {
              item['userMeta'] = data;
              //console.log(`${elm.username} is ${data.UserAttributes.find((ualm) => { return ualm.Name === "name"}).Value}`)
            }
          }).promise()
        );
      });

      //theorically wait until all lookup is done.
      Promise.all( lookupPromises ).then( () => {
        resolve();
      }, () => {
        console.log(`Unable to find some users`);
        resolve();
      })
    });
  } catch(e){
    console.log('error getting username from identityId');
    console.error(e);
    callback(null, failure({ status: false }));
    return;
  };

};

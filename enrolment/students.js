import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import AWS from 'aws-sdk';

/*
  show the users that is enrolled in a courseId
  TODO: somehow contact cognito federated identity, and gleam user id from there
*/
export async function main(event, context, callback) {
  const params = {
    TableName: "enrolment",
    IndexName: 'courseId-index',
    // 'KeyConditionExpression' defines the condition for the query
    // - 'userId = :userId': only return items with matching 'userId'
    //   partition key
    // 'ExpressionAttributeValues' defines the value in the condition
    // - ':userId': defines 'userId' to be Identity Pool identity id
    //   of the authenticated user
    KeyConditionExpression: "courseId = :courseId",
    ExpressionAttributeValues: {
      ":courseId": event.pathParameters.id
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    console.log('result.Items', result.Items);

    // Return the matching list of items in response body
    if(result.Items.length > 0){
      await updateMeta(result);
    };

    //wait 5s
    console.log('wait 2s');
    await new Promise(resolve => setTimeout(resolve, 2000));

    callback(null, success(result.Items));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

async function updateMeta(result){
  console.log('asking cognto identity pool for more info');
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
    console.log('attempt to get username from identityId');
    userQueryResults = await dynamoDbLib.call('batchGet', userQueryParams);
  } catch(e){
    console.log('error getting username from identityId');
    console.error(e);
    callback(null, failure({ status: false }));
    return;
  };

  if(!userQueryResults.Responses.identLookUp){
    return;
  };

  const identSrv = new AWS.CognitoIdentityServiceProvider({region:'ap-southeast-1'});
  const userPoolId = 'ap-southeast-1_SDZuB7De0';

  /*
    this part get's left behind, wrap this into a promise !!??
  */
  console.log('attempt to add metadata to each user enrolment data');
  //cycle throught the userQueryParams, but somehow, doesn't wait for everything to finish
  await userQueryResults.Responses.identLookUp.forEach( async (elm) => {
    console.log(`looking up attributes for ${elm.username} / ${elm.identityId}` );
    await identSrv.adminGetUser({ UserPoolId:userPoolId, Username: elm.username}, (err,data) => {
      if(err){
        console.log('error looking up');
        console.err(err)
      } else {
        var findResult = result.Items.find( (resultElm) => resultElm.userId === elm.identityId );
        console.log('findResult', findResult);
        findResult['userMeta'] = data;
        console.log('result', result);
      };
    })
  });

  console.log('result inside updateMeta', result);

  return result;

};

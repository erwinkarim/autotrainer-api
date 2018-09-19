import { success, failure } from "./libs/response-lib";
import AWS from 'aws-sdk';

export async function main(event, context, callback) {
  // console.log('running userInfo');
  // callback(null, success({ message: 'ok'}));

  // get user data
  const data = JSON.parse(event.body);

  // check the user info from body
  const cognitoClient = new AWS.CognitoIdentityServiceProvider({region:'ap-southeast-1'});
  const UserPoolId = 'ap-southeast-1_SDZuB7De0';
  const Username = data.username;
  let userinfo = {};

  // get userinfo promise
  const userInfoPromise = new Promise((resolve, reject) => {
    cognitoClient.adminGetUser({ UserPoolId, Username}, (err, data) => {
      if (err) {
        // console.log('something went wrong');
        reject(err);
      } else {
        // console.log('get user info ok');
        Object.assign(userinfo, data);
        resolve();
      };
    });
  });

  // get groups promise
  const userGroupPromise = new Promise((resolve, reject) => {
    cognitoClient.adminListGroupsForUser({ UserPoolId, Username }, (err, data) => {
      if (err) {
        // console.log('something went wrong');
        reject(err);
      } else {
        // console.log('get user group info ok');
        Object.assign(userinfo, data);
        resolve();
      };
    });
  });

  // collase all promise then
  try {
    await Promise.all([userInfoPromise, userGroupPromise])
    callback(null, success(userinfo));
  } catch(err) {
      callback(null, failure(err));
  }
};

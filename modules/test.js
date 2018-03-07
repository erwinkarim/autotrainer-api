import { success, failure } from "./libs/response-lib";
import userLookup from './libs/userLookup';

/*
  test function to go test queries
*/
export async function main(event, context, callback) {
  //attemp to get cognito attributes from given identityId
  //const identityId = 'ap-southeast-1:71650064-bad8-425b-9e95-24cca8810a90';
  const identityId = 'ap-southeast-1:71650064-425b-9e95-24cca8810a90';
  console.log(`looking for ${identityId}`);
  try {
    const result = await userLookup(identityId);
    callback(null, success(result));
  } catch(e){
    console.log('could not find user');
    callback(null, failure());
  }

}

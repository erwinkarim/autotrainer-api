import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  enrol a user into the course
  TODO: handle enrollment when you already invited.
    plan: convert username into userId
*/
export async function main(event, context, callback) {
  const data = JSON.parse(event.body);

  //if email context, find the current enrolment and update that instead
  // update: can't update the entry because userId is the key, instead need to delete that and let it create a new entry for this
  if(data.enrolmentContext){
    if(data.enrolmentContext === 'email'){
      //get enrolment data
      //if data found, delete it and let it create a new entry w/ enrolled key
      const getParams = {
        TableName:'enrolment',
        Key: {
          userId: data.email,
          courseId: data.courseId
        }
      }

      var result = null;
      try{
        result = await dynamoDbLib.call('get', getParams);
      } catch(e){
        console.log('error getting data');
        console.log(e);
        callback(null, failure({status:false}))
        return;
      }

      //delete if found
      if(result.Item){
        const deleteParams = {
          TableName:'enrolment',
          Key: {
            userId: data.email,
            courseId: data.courseId
          }
        };

        try{
          await dynamoDbLib.call('delete', deleteParams);
        } catch(e){
          console.log('error deleting entry');
          console.log(e);
          callback(null, failure({status:false}))
          return;
        }

      };
    };
  };

  //create new enrolment record
  const params = {
    TableName: "enrolment",
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      courseId: data.courseId,
      createdAt: new Date().getTime(),
      progress: [],
      status: 'enrolled'
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    callback(null, success(params.Item));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

import * as dynamoDbLib from "./dynamodb-lib";
import uuid from "uuid";

/*
  check attendance of the user
  * if user aleady have a cert, drop this
  * if the user recently complete the attendance (published_count === progress.length)
    generate the cert
  * if not complete attendance, ignore

  * status code returns
    -1 current progress is less than publishedModuleCount
    0 new certificate  issued
    1 certificate already issued
    2 publishedModuleCount column does not exists in course table
 */
export default async function check_cert(userId, courseId){

  //get both the course entry and enrolment entry
  const params = {
    RequestItems:{
      'courses':{
        Keys: [{courseId:courseId}],
        ProjectionExpression: 'courseId, publishedModuleCount'
      },
      'enrolment':{
        Keys: [ {userId:userId, courseId:courseId}],
        ProjectionExpression: 'userId, courseId, progress, cert'
      }
    }
  };

  var result = null;
  try {
    result = await dynamoDbLib.call('batchGet', params);
    //console.log('result.Responses.courses', result.Responses.courses);
    //console.log('result.Responses.enrolment', result.Responses.enrolment);
  } catch(e){
    throw 'error getting course/enrolment data';
    console.log(e);
  }

  //check the results
  var course = result.Responses.courses[0];
  var enrolment = result.Responses.enrolment[0];

  //if cert is already there, return
  if(enrolment.cert){
    console.log('Certificate already exists');
    return 1;
  }

  //if publishedModuleCount does not exist, ignore
  if(!course.publishedModuleCount){
    console.log('publishedModuleCount does not exists');
    return 2;
  }

  //if current progress is less than course count
  if(enrolment.progress.length < course.publishedModuleCount){
    console.log('current progress is less than published module count');
    return -1;
  }

  //current situation is cert is not there and enrolment progress matches publishedModuleCount
  // create the cert
  //console.log('course complete. start attendance certificate issuance');
  const cert = {
    issued: Date.now(),
    id: uuid.v4()
  }

  const updateParams = {
    TableName: 'enrolment',
    Key: {
      courseId: courseId,
      userId: userId
    },
    ConditionExpression: "userId = :userId",
    UpdateExpression: `SET certId = :certId, certIssued = :certIssued, #s = :newStatus`,
    ExpressionAttributeValues: {
      ':certId': cert.id,
      ':certIssued' : cert.issued,
      ':userId': userId,
      ':newStatus': 'completed',
    },
    ExpressionAttributeNames: {
      '#s': 'status',
    },
    ReturnValues: 'ALL_NEW'
  };

  try{
    // console.log('issue cert');
    const certResult = await dynamoDbLib.call('update', updateParams);
    //console.log('certResult', certResult);
    return certResult;

  }catch(e){
    console.log(e);
    return Promise.reject( 'error updating enrolment for cert issuance' );
  }



}

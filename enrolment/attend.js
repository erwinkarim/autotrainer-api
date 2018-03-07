import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import check_cert from './libs/check-cert.js';
import userLookup from './libs/userLookup';
const sgMail = require('@sendgrid/mail');

/*
  update the record that userId has attend the class X of course Y
  TODO: code clean up so less calls to dynamodb
*/
export async function main(event, context, callback) {
  // 1. get the appropiate enrolment entry
  // 2. update the entry to append the progress field if necessary
  // 3. issue cert if all classes has been enrolled
  // 3a. send email about cert issuenace
  /*
    check if the user is enrolled in the course
   */
  //console.log('checking enrolment');
  var params = {
    TableName: "enrolment",
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      courseId: event.pathParameters.id
    }
  };

  var result = null;
  try{
    result = await dynamoDbLib.call("get", params);
  } catch(e){
    console.log('error getting course info');
    console.log(e);
    callback(null, failure({ status: false }));
  }

  // user is not enrolled in the course, return failed
  if(!result.Item){
    callback(null, failure({ status: false }));
    return -1;
  }

  var classes = result.Item.progress;

  //check if the user attend the module, append when necessary
  if(classes.includes(event.pathParameters.moduleId)){
    //console.log('user already attend module');
    callback(null, success({ status: true }));
    return 0;
  };

  //User hasn't attend, class, update
  //console.log('push moduleId into classes');
  classes.push(event.pathParameters.moduleId);

  // now append the progress field w/ the moduleId
  params = {
    TableName: "enrolment",
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      courseId: event.pathParameters.id
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET progress = :progress",
    ExpressionAttributeValues: {
      ":progress": classes
    },
    ReturnValues: "ALL_NEW"
  };


  //record the course progress
  var result = null
  try {
    //console.log('update new enrolment item');
    result = await dynamoDbLib.call("update", params);
    //callback(null, success({ status: true }));
  } catch (e) {
    console.log('failed to update progress');
    console.log(e)
    callback(null, failure({ status: false }));
  }

  //if all the modules in the course has been attended, issue attandance cert.
  // TODO: send email congratulating and link to the cert
  var checkResult = null;
  try {
    checkResult = await check_cert(event.requestContext.identity.cognitoIdentityId, event.pathParameters.id);
    //console.log('checkResult', checkResult);
    if(checkResult === 1 || checkResult === -1){
      //cert is already there or still incomplete
      callback(null, success({ status: checkResult }));
      return;
    }
  } catch(e){
    console.log('failed to check cert');
    console.log(e);
    callback(null, failure({ status: false }));
    return;
  }

  //get course info
  const courseParams = {
    TableName:'courses',
    Key: { courseId: event.pathParameters.id },
    ProjectionExpression: "courseId, #name",
    ExpressionAttributeNames: { "#name": 'name' }
  };
  //console.log('courseParams', courseParams);
  var courseInfo = null;
  try{
    courseInfo = await dynamoDbLib.call('get', courseParams);
    //console.log('courseInfo', courseInfo);
    if(!courseInfo.Item){
      console.log('course info not found');
      callback(null, failure());
      return;
    }

  } catch(e){
    console.log('error getting course info');
    console.log(e);
    callback(null, failure());
    return;
  }

  //get user info
  var user = null;
  try{
    user = await userLookup(event.requestContext.identity.cognitoIdentityId);
    //console.log('user', user);
  } catch(e){
    console.log('error looking up identity');
    callback(null, failure({ status: false }));
    return;
  }

  const userEmail = user.UserAttributes.find( (elm) => elm.Name === 'email').Value;
  const userName = user.UserAttributes.find( (elm) => elm.Name === 'name').Value;
  const msg = {
    from: { name: 'learn@AP', email: 'learn@actuarialpartners.com' },
    templateId: 'd7c64e9d-a04b-4eaf-b861-a2e056f2be74',
    to: { name: userName, email: userEmail },
    substitutions: {
      student: userName,
      course_name: courseInfo.Item.name,
      cert_url: `https://bazinga.actuarialpartners.com/verify_cert?certNo=${checkResult.Attributes.certId}`
    }
  };
  //console.log('msg', msg);

  //now can we send the damn email??
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  sgMail.setSubstitutionWrappers('{{', '}}'); // Configure the substitution tag wrappers globally
  sgMail
    .send(msg)
    .then( () => {
      console.log('successfully sent emails');
      callback(null, success({msg:'success'}));
    })
    .catch( err => {
      console.log('error sending mails');
      console.log( err.toString() );
      callback(null, failure({ status: false, error: "error sending emails" }));
    });


}

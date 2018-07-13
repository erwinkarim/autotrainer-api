import { success, failure } from "./libs/response-lib";
import AWS from 'aws-sdk';
import * as dynamoDbLib from "./libs/dynamodb-lib";
const sgMail = require('@sendgrid/mail');

/*
  invite people to the course for enrollment
  * required:-
    body.inviteList = names and email to be invited
    body.meta = constains meta info like course_owner (saving a lookup)
    pathParameters.id = the courseId to be included
  * plan: -
    use sendgrid to send the emails
*/
export async function main(event, context, callback) {
  const body = JSON.parse(event.body);

  //get course info, description, etc
  const params = {
    TableName: 'courses',
    Key: { courseId: event.pathParameters.id }
  };

  var result = null;
  try {
    result = await dynamoDbLib.call('get', params);

    if(!result.Item){
      callback(null, failure({ status: false, error: "Item not found." }));
      return;
    }
  } catch (e){
    console.log('error getting course info');
    console.log(e);
    callback(null, failure({ status: false, error: "Error getting course info." }));
    return
  }

  //add the emails info in the enrolment table
  /*
    just add the email addresses as the userId so other people being invited for the course would know
  */
  const createParams = {
    RequestItems: {
      'enrolment': body.inviteList.map( (e,i) => {
        return {
          PutRequest: {
            Item: {
              'userId': e.email,
              'courseId': event.pathParameters.id,
              'createdAt': Date.now(),
              'progress': [],
              'status': 'invited'
            }
          }
        };
      })
    }
  }

  try{
    await dynamoDbLib.call('batchWrite', createParams);
  } catch(e) {
    console.log('error creating enrolment');
    console.log(e);
    callback(null, failure({ status: false, error: "Unable to create enrolment items." }));
    return;

  }
  //setup personalization for each recipient
  const personalize = body.inviteList.map( (e,i) => {
    return {
      key:i,
      to: { email: e.email, name:e.name},
      substitutions: { invitee: e.name }
    };
  })

  //now actually send the email
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  sgMail.setSubstitutionWrappers('{{', '}}'); // Configure the substitution tag wrappers globally
  const msg = {
    from: {
      name: 'learn@AP',
      email: 'learn@actuarialpartners.com'
    },
    templateId: 'f927fce9-07fe-48ac-853e-5f9421d51889',
    personalizations: personalize,
    substitutions: {
      course_name: result.Item.name,
      course_owner: body.meta.course_owner,
      course_description: result.Item.description,
      course_url: `https://bazinga.actuarialpartners.com/courses/promo/${event.pathParameters.id}`
    }
  };

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


  /*
    send emails to everyone in the inviteList w/ the inviteMessage about
    pathParameters.id course
  */

  /*
    add the people in the invite list to the enrolment table
      if the emails are not in federated identity, then save as email,
      so it'd be converted into federated identity as the user logs in
  */

  /*
    currently, can only send to verified addresses due to AWS default sending limit.
    already requested to update the limits on 19/2/2018, we'll see what will happens next.
  */
  return
}

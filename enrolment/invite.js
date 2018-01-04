
/*
  invite people to the course for enrollment
  * required:-
    body.inviteList = names and email to be invited
    body.inviteMessage = the message that to be put in the email body
    pathParameters.id = the courseId to be included
  * plan: -
    send email in batch based on inviteList
    use bulk template mail to send invite
    refer to https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html#sendBulkTemplatedEmail-property
*/
export async function main(event, context, callback) {
  /*
    send emails to everyone in the inviteList w/ the inviteMessage about
    pathParameters.id course
  */

  /*
    add the people in the invite list to the enrolment table
      if the emails are not in federated identity, then save as email,
      so it'd be converted into federated identity as the user logs in
  */
  console.log('do something');
  return {message:'working on it'};
}

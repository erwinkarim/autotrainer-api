import { success, failure } from "./libs/response-lib";

const sgClient = require('@sendgrid/client');
sgClient.setApiKey(process.env.SENDGRID_API_KEY);

/*
  register email from event
 */
export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const request = {
    method:'POST',
    url: '/v3/contactdb/recipients',
    body: [ { email: data.email, first_name:data.FNAME , last_name: data.LNAME } ],
  };

  try {
    await sgClient
      .request(request)
      .then( ([response,body]) => {
        console.log(`email ${data.email} signed up`);
        return callback(null, success());
      });
  } catch (e) {
    console.log('error register email');
    console.log(e)
    return callback(null, failure());
  }
};

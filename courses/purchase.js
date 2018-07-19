import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

// check coupon code based on courseId
const checkCoupon = async (courseId, code) => {
  const params = {
    TableName: "courses",
    Key: {
      courseId: courseId,
    },
  };

  try {
    const result = await dynamoDbLib.call("get", params);
    const course = result.Item;

    if (course.coupons) {
      if (course.coupons[0].code === code) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }

  } catch (e) {
    console.log('error getting course')
    return false;
  }
};

// maybe try to recycle this from enrolment/create script ??
/*
  purchase the course
  1. using coupon. verify the coupon, add enrolment if it's true
  2. using credit card. verify the credit card using payment gateway, add enrolment if it's success

  expected return value
  {
    message: everything is ok
    enrolment: enrolment entry
  }
 */
export async function main(event, context, callback) {
  console.log('test purchase fn')
  const data = JSON.parse(event.body);
  const courseId = event.pathParameters.id;

  if (data.method === 'coupon') {
    // check for coupon,
    const result = await checkCoupon(courseId, data.code);

    // if ok, create enrolment entry and then return results
    if (result) {
      console.log('Coupon purchase ok');

    } else {
      callback(null, failure('Wrong coupon code'));
      return;
    }
    // if not ok, send error message
  } else if (data.method === 'creditCard') {
    // validate and attempt to purchase
    // if ok, create enrolment entry and return results
    // if not ok, send error message
  }

  // if you reach here, mean payment was successful
  // create and return enrolment
  // tried to result from enrolment/create.js, but causing issues when deployed
  // enrolment/create should use a common script to create enrolment
  const params = {
    TableName: "enrolment",
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      courseId: courseId,
      createdAt: new Date().getTime(),
      progress: [],
      status: 'enrolled'
    }
  };
  try {
    await dynamoDbLib.call('put', params);
    callback(null, success(params.Item));
  } catch (e) {
    callback(null, failure('Unable to create enrolment'));
    console.log('error generating enrolment');
    console.log(e);
  }
};

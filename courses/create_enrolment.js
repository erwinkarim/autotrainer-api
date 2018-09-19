import * as dynamoDbLib from "./libs/dynamodb-lib";

/*
  common file to create modules
  throws error if unable to create in dynamodb
  returns an enrolment object if successful
 */
export default async function create_module(courseId, userId){
  const params = {
    TableName: "enrolment",
    Item: {
      userId: userId,
      courseId: courseId,
      createdAt: new Date().getTime(),
      progress: [],
      status: 'enrolled'
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return params.Item;
  } catch (e) {
    console.log(e);
    throw new Error('Unable to create enrolment entry');
  }

 }

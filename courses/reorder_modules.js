import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  reorder the modules
  * expected queryStringParameters:
  modules: [{moduleId:x, order:y}, ... ]
*/
export async function main(event, context, callback) {
  /*
    plan:
      based on event.body.new_order, update the selected modules based on the new order
  */

  const data = JSON.parse(event.body);
  var updatePromises = [];

  data.new_order.forEach( (e,i) => {
    const updateParams = {
        TableName: 'modules',
        Key: { courseId: event.pathParameters.id, moduleId: e.moduleId },
        ConditionExpression: "userId = :userId",
        UpdateExpression:' set #o = :order',
        ExpressionAttributeValues: {
          ':order': parseInt(e.order),
          ':userId': event.requestContext.identity.cognitoIdentityId
        },
        ExpressionAttributeNames: { '#o': 'order'},
        ReturnValues: "ALL_NEW"
    };
    updatePromises.push( dynamoDbLib.call('update', updateParams));
  })

  try {
    //wait until all is updated
    await Promise.all(updatePromises);

    const moduleParams = {
      TableName: 'modules',
      KeyConditionExpression: 'courseId = :courseId',
      ExpressionAttributeValues: { ':courseId' : event.pathParameters.id }
    };

    var results = await dynamoDbLib.call( 'query', moduleParams);
    if(results.Items){
      //return all updated modules
      callback(null, success(results.Items));
      return;
    } else {
      console.log('error updating the module');
      callback(null, failure({msg:'Error getting update modules'}));
    }

  }catch(e){
    console.log('error updating a module');
    console.log(e);
    callback(null, failure());
    return;

  }
}

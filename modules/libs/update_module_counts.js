import * as dynamoDbLib from "./dynamodb-lib";

/*
  function to update course count based on courseId
*/
export default async function update_module_counts(courseId, userId){
  var countParams = {
    TableName: "modules",
    KeyConditionExpression: 'courseId = :courseId',
    ExpressionAttributeValues: {
      ':courseId': courseId
    },
    ProjectionExpression: "courseId, moduleId",
    select: 'COUNT'
  };

  try {
    //console.log('attemp to get module count');
    var result = await dynamoDbLib.call('query', countParams);
    var moduleCount = result.Count;

    countParams = {
      TableName: "courses",
      Key: {
        courseId: courseId
      },
      UpdateExpression: "SET moduleCount = :moduleCount",
      ConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":moduleCount" : moduleCount,
        ":userId": userId
      },
      ReturnValues: "ALL_NEW"
    }

    //update course count
    //console.log(`attemp to update course count with value ${moduleCount}`);
    result = await dynamoDbLib.call('update', countParams);

    //everything ok, return 0
    return 0;

  } catch(e){
    console.log('error getting module count');
    console.log(e);
    callback(null, failure({ status: false }));
  }

}

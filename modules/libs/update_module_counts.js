import * as dynamoDbLib from "./dynamodb-lib";

/*
  function to update course count based on courseId
  UPDATE: count both published and unpublished courses
*/
export default async function update_module_counts(courseId, userId){
  // count all modules
  var countParams = {
    TableName: "modules",
    KeyConditionExpression: 'courseId = :courseId',
    ExpressionAttributeValues: {
      ':courseId': courseId
    },
    ProjectionExpression: "courseId, moduleId",
    select: 'COUNT'
  };

  var countPublishedParams = Object.assign( {}, countParams );
  countPublishedParams['FilterExpression'] = 'publish_status = :publish_status';
  countPublishedParams.ExpressionAttributeValues = {
    ':courseId': courseId, ":publish_status": 'published'
  };


  try {
    //console.log('attemp to get module count');
    var result = await dynamoDbLib.call('query', countParams);
    var moduleCount = result.Count;

    //get published count
    var result = await dynamoDbLib.call('query', countPublishedParams);
    var publishedCount = result.Count;

    countParams = {
      TableName: "courses",
      Key: {
        courseId: courseId
      },
      UpdateExpression: "SET moduleCount = :moduleCount, publishedModuleCount = :publishedModuleCount",
      ConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":moduleCount" : moduleCount,
        ":publishedModuleCount" : publishedCount,
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

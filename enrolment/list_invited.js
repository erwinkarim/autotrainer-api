import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  List invited by the user, based on email address
*/
export async function main(event, context, callback) {
  //get courses that is invited. userId === email
  const params = {
    TableName: 'enrolment',
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.queryStringParameters.email
    }
  }

  var result = [];

  try {
    result = await dynamoDbLib.call("query", params);

    //if result if empty. immediately return
    if(result.Items.length === 0){
      callback(null, success(result.Items));
      return;
    }
  } catch(e){
    console.log('error getting invited courses');
    console.log(e);
    callback(null, failure({msg:'error getting invited courses'}));
  }

  //get course info (name, description, etc)
  //get course title, based on enrolment
  const courseTitleParams = {
    RequestItems: {
      "courses" : {
        Keys: result.Items.map( (c,i) => { return {courseId:c.courseId}; } ),
        ExpressionAttributeNames: {"#name": "name"},
        ProjectionExpression: "courseId, #name, description, bg_pic, title_font_color",
      }
    }
  };

  try{
    var result2 = await dynamoDbLib.call('batchGet', courseTitleParams);
    result.Items.map( (c, i) => {
      c["name"] = result2.Responses.courses.find( (e) => e.courseId === c.courseId).name;
      c["description"] = result2.Responses.courses.find( (e) => e.courseId === c.courseId).description;
      c["bg_pic"] = result2.Responses.courses.find( (e) => e.courseId === c.courseId).bg_pic;
      c["title_font_color"] = result2.Responses.courses.find( (e) => e.courseId === c.courseId).title_font_color;
    });
    callback(null, success(result.Items));
    return;

  } catch(e){
    console.log('error getting course meta info');
    console.log(e);
    callback(null, failure({msg:'error getting meta info on courses'}));
    return;
  }
}

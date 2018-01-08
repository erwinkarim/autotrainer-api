import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
  a trigger that is run when a module is created or updated
*/
export async function main(event, context, callback) {
  console.log('update_module_count: event', event);
}

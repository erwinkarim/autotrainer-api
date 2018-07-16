import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

/*
const adyenEncrypt = require('adyen-cse-web');
const options = {};
const cseInstance = adyenEncrypt.createEncryption(
  "B3CA83A5FF2F8E7B535325B076FABFBAA6FC3697C8298A479980AADCDD043912",
  options
);
*/


/**
 * purchase api using Adyen
   plan: -
   * create instance
   * send data
 */
export async function main(event, context, callback) {
  console.log('test purchase fn')

};

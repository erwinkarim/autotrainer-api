import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
  callback(null, success({ message: 'ok'}));
};

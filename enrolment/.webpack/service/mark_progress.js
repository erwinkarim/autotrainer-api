(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = undefined;

var _regenerator = __webpack_require__(1);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = __webpack_require__(2);

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = __webpack_require__(3);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/*
  function to mark a modules progress
  (ie, what questions that has been answered, how far in the video ,etc)
*/
var main = exports.main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(event, context, callback) {
    var attendance, result, enrolment_status, moduleId, current_progress, obj, updatedProgress, _result;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // get current enrolment status w/ progress
            attendance = {
              TableName: "enrolment",
              Key: {
                userId: event.requestContext.identity.cognitoIdentityId,
                courseId: event.pathParameters.id
              }
            };
            result = null;
            _context.prev = 2;
            _context.next = 5;
            return dynamoDbLib.call("get", attendance);

          case 5:
            result = _context.sent;


            //return error if enrolment record is not found
            if (!result.Item) {
              callback(null, (0, _responseLib.failure)({ status: false, error: "Enrolment record not found." }));
            };

            _context.next = 15;
            break;

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](2);

            console.log('error getting enrolment');
            console.log(_context.t0);
            callback(null, (0, _responseLib.failure)({ status: false }));

          case 15:
            enrolment_status = result.Item;
            moduleId = event.pathParameters.moduleId;

            //console.log('event.body', event.body);

            if (enrolment_status.progress_detail) {

              // find the current progress
              current_progress = enrolment_status.progress_detail.find(function (e) {
                return (0, _keys2.default)(e)[0] === event.pathParameters.moduleId;
              });

              // update or push a new one

              if (current_progress !== undefined) {
                current_progress[moduleId] = event.body;
              } else {
                obj = {};

                obj[moduleId] = event.body;
                enrolment_status.progress_detail.push(obj);
              }
            } else {
              // create a new progress if there's nothing in it
              obj = {};

              obj[moduleId] = event.body;
              enrolment_status.progress_detail = [obj];
            }

            //upload to dynamodb
            updatedProgress = {
              TableName: 'enrolment',
              Key: {
                userId: event.requestContext.identity.cognitoIdentityId,
                courseId: event.pathParameters.id
              },
              UpdateExpression: "SET progress_detail = :progress_detail",
              ExpressionAttributeValues: {
                ":progress_detail": enrolment_status.progress_detail
              },
              ReturnValues: "ALL_NEW"
            };
            _context.prev = 19;
            _context.next = 22;
            return dynamoDbLib.call('update', updatedProgress);

          case 22:
            _result = _context.sent;

            callback(null, (0, _responseLib.success)(_result.Attributes));

            _context.next = 31;
            break;

          case 26:
            _context.prev = 26;
            _context.t1 = _context["catch"](19);

            console.log('error updating current progress');
            console.log(_context.t1);
            callback(null, (0, _responseLib.failure)({ status: false }));

          case 31:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[2, 10], [19, 26]]);
  }));

  return function main(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var _dynamodbLib = __webpack_require__(4);

var dynamoDbLib = _interopRequireWildcard(_dynamodbLib);

var _responseLib = __webpack_require__(6);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/regenerator");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/object/keys");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/asyncToGenerator");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.call = call;

var _awsSdk = __webpack_require__(5);

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk2.default.config.update({ region: "ap-southeast-1" });

function call(action, params) {
  var dynamoDb = new _awsSdk2.default.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = __webpack_require__(7);

var _stringify2 = _interopRequireDefault(_stringify);

exports.success = success;
exports.failure = failure;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function success(body) {
  return buildResponse(200, body);
}

function failure(body) {
  return buildResponse(500, body);
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: (0, _stringify2.default)(body)
  };
}

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/json/stringify");

/***/ })
/******/ ])));
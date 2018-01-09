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

var _asyncToGenerator2 = __webpack_require__(2);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/*
  list all courses attended by a particular user
  TODO: get enrolled courses info (title, etc
  TODO: get total modules for each course
*/
var main = exports.main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(event, context, callback) {
    var params, result, courseIds, courseTitleParams, result2;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            //get courses that is enrolled
            params = {
              TableName: "enrolment",
              // 'KeyConditionExpression' defines the condition for the query
              // - 'userId = :userId': only return items with matching 'userId'
              //   partition key
              // 'ExpressionAttributeValues' defines the value in the condition
              // - ':userId': defines 'userId' to be Identity Pool identity id
              //   of the authenticated user
              KeyConditionExpression: "userId = :userId",
              ExpressionAttributeValues: {
                ":userId": event.requestContext.identity.cognitoIdentityId
              }
            };
            result = null;
            _context.prev = 2;
            _context.next = 5;
            return dynamoDbLib.call("query", params);

          case 5:
            result = _context.sent;

            if (!(result.Items.length === 0)) {
              _context.next = 9;
              break;
            }

            callback(null, (0, _responseLib.success)(result.Items));
            return _context.abrupt("return");

          case 9:
            _context.next = 16;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](2);

            console.log('failure to get enrolment');
            console.log(_context.t0);
            callback(null, (0, _responseLib.failure)({ status: false }));

          case 16:

            // get list of courseIds based on enrolment
            courseIds = result.Items.map(function (e, i) {
              return { courseId: e.courseId };
            });

            //get course title, based on enrolment

            courseTitleParams = {
              RequestItems: {
                "courses": {
                  Keys: courseIds,
                  ExpressionAttributeNames: { "#name": "name" },
                  ProjectionExpression: "courseId, #name, moduleCount"
                }
              }
            };
            result2 = null;
            _context.prev = 19;
            _context.next = 22;
            return dynamoDbLib.call('batchGet', courseTitleParams);

          case 22:
            result2 = _context.sent;

            console.log('result2', result2.Responses.courses);
            // TODO: issues if the course got deleted
            result.Items.map(function (c, i) {
              c["name"] = result2.Responses.courses.find(function (e) {
                return e.courseId === c.courseId;
              }).name;
              c["moduleCount"] = result2.Responses.courses.find(function (e) {
                return e.courseId === c.courseId;
              }).moduleCount;
            });
            callback(null, (0, _responseLib.success)(result.Items));
            _context.next = 32;
            break;

          case 28:
            _context.prev = 28;
            _context.t1 = _context["catch"](19);

            console.log(_context.t1);
            callback(null, (0, _responseLib.failure)({ status: false }));

          case 32:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[2, 11], [19, 28]]);
  }));

  return function main(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var _dynamodbLib = __webpack_require__(3);

var dynamoDbLib = _interopRequireWildcard(_dynamodbLib);

var _responseLib = __webpack_require__(5);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/regenerator");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/asyncToGenerator");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.call = call;

var _awsSdk = __webpack_require__(4);

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk2.default.config.update({ region: "ap-southeast-1" });

function call(action, params) {
  var dynamoDb = new _awsSdk2.default.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
}

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = __webpack_require__(6);

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
/* 6 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/json/stringify");

/***/ })
/******/ ])));
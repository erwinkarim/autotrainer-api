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
  update the record that userId has attend the class X of course Y
*/
var main = exports.main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(event, context, callback) {
    var params, result, classes, _result;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // 1. get the appropiate enrolment entry
            // 2. update the entry to append the progress field if necessary
            // 3. issue cert if all classes has been enrolled
            /*
              check if the user is enrolled in the course
             */
            console.log('checking enrolment');
            params = {
              TableName: "enrolment",
              Key: {
                userId: event.requestContext.identity.cognitoIdentityId,
                courseId: event.pathParameters.id
              }
            };
            result = null;
            _context.prev = 3;
            _context.next = 6;
            return dynamoDbLib.call("get", params);

          case 6:
            result = _context.sent;
            _context.next = 14;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](3);

            console.log('error getting course info');
            console.log(_context.t0);
            callback(null, (0, _responseLib.failure)({ status: false }));

          case 14:
            if (result.Item) {
              _context.next = 17;
              break;
            }

            callback(null, (0, _responseLib.failure)({ status: false }));
            return _context.abrupt("return", -1);

          case 17:
            classes = result.Item.progress;
            /*
              check if the user attend the module, append when necessary
             */

            if (!classes.includes(event.pathParameters.moduleId)) {
              _context.next = 22;
              break;
            }

            console.log('user already attend module');
            callback(null, (0, _responseLib.success)({ status: true }));
            return _context.abrupt("return", 0);

          case 22:
            ;

            /*
              User hasn't attend, class, update
             */
            console.log('push moduleId into classes');
            classes.push(event.pathParameters.moduleId);

            // now append the progress field w/ the moduleId
            params = {
              TableName: "enrolment",
              // 'Key' defines the partition key and sort key of the item to be updated
              // - 'userId': Identity Pool identity id of the authenticated user
              // - 'noteId': path parameter
              Key: {
                userId: event.requestContext.identity.cognitoIdentityId,
                courseId: event.pathParameters.id
              },
              // 'UpdateExpression' defines the attributes to be updated
              // 'ExpressionAttributeValues' defines the value in the update expression
              UpdateExpression: "SET progress = :progress",
              ExpressionAttributeValues: {
                ":progress": classes
              },
              ReturnValues: "ALL_NEW"
            };

            _context.prev = 26;

            console.log('update new enrolment item');
            _context.next = 30;
            return dynamoDbLib.call("update", params);

          case 30:
            _result = _context.sent;

            callback(null, (0, _responseLib.success)({ status: true }));
            _context.next = 39;
            break;

          case 34:
            _context.prev = 34;
            _context.t1 = _context["catch"](26);

            console.log('failed to update progress');
            console.log(_context.t1);
            callback(null, (0, _responseLib.failure)({ status: false }));

          case 39:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 9], [26, 34]]);
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
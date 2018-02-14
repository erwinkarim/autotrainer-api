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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = undefined;

var _regenerator = __webpack_require__(2);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = __webpack_require__(3);

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = __webpack_require__(4);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var main = exports.main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(event, context, callback) {
    var params, cert, result, infoParams, identSrv, userPoolId, getUserFn;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            //go find that cert
            params = {
              TableName: "enrolment",
              IndexName: "certId-index",
              KeyConditionExpression: "certId = :certId",
              ExpressionAttributeValues: {
                ":certId": event.queryStringParameters.certId
              }

              //console.log('params', params);

              //cert look up
            };
            cert = null;
            result = null;
            _context.prev = 3;
            _context.next = 6;
            return dynamoDbLib.call('query', params);

          case 6:
            result = _context.sent;

            if (!(result.Items.length > 0)) {
              _context.next = 11;
              break;
            }

            //callback(null, success(result.Items[0]));
            cert = result.Items[0];
            _context.next = 13;
            break;

          case 11:
            callback(null, (0, _responseLib.failure)({ status: false, error: "Item not found." }));
            return _context.abrupt("return");

          case 13:
            ;

            _context.next = 22;
            break;

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](3);

            console.log('error executing query');
            console.log(_context.t0);
            callback(null, (0, _responseLib.failure)({ status: false }));
            return _context.abrupt("return");

          case 22:

            //get additional info (username, coursename, etc ...)
            infoParams = {
              RequestItems: {
                'courses': {
                  Keys: [{ courseId: cert.courseId }]
                },
                'identLookUp': {
                  Keys: [{ identityId: cert.userId }]
                }
              }
            };
            _context.prev = 23;
            _context.next = 26;
            return dynamoDbLib.call('batchGet', infoParams);

          case 26:
            result = _context.sent;

            cert.coursename = result.Responses.courses[0].name;
            cert.username = result.Responses.identLookUp[0].username;

            //callback(null, success(cert));

            _context.next = 37;
            break;

          case 31:
            _context.prev = 31;
            _context.t1 = _context["catch"](23);

            console.log('error getting additional info');
            console.log(_context.t1);
            callback(null, (0, _responseLib.failure)({ status: false }));
            return _context.abrupt("return");

          case 37:

            //get actual name from the username
            identSrv = new _awsSdk2.default.CognitoIdentityServiceProvider({ region: 'ap-southeast-1' });
            userPoolId = 'ap-southeast-1_SDZuB7De0';
            _context.prev = 39;

            //the call back is not being waited, have to do a 1-second sleep timer for now
            //get actual name
            getUserFn = new _promise2.default(function (resolve, reject) {
              identSrv.adminGetUser({ UserPoolId: userPoolId, Username: cert.username }, function (err, data) {
                if (err) {
                  console.log('error looking up', cert);
                  console.error(err);
                } else {
                  cert.actualname = data.UserAttributes.find(function (elm) {
                    return elm.Name === 'name';
                  }).Value;
                  //console.log('cert.actualname', cert.actualname);
                  resolve();
                };
              });
            });

            //now actually drop the cert after callback completed

            getUserFn.then(function () {
              callback(null, (0, _responseLib.success)(cert));
            });

            _context.next = 49;
            break;

          case 44:
            _context.prev = 44;
            _context.t2 = _context["catch"](39);

            console.log('error retriving user info');
            console.log(_context.t2);
            return _context.abrupt("return");

          case 49:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 16], [23, 31], [39, 44]]);
  }));

  return function main(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}(); /*
       API call to find the cert
     */


var _responseLib = __webpack_require__(5);

var _dynamodbLib = __webpack_require__(7);

var dynamoDbLib = _interopRequireWildcard(_dynamodbLib);

var _awsSdk = __webpack_require__(0);

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/regenerator");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/promise");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/asyncToGenerator");

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

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.call = call;

var _awsSdk = __webpack_require__(0);

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk2.default.config.update({ region: "ap-southeast-1" });

function call(action, params) {
  var dynamoDb = new _awsSdk2.default.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
}

/***/ })
/******/ ])));
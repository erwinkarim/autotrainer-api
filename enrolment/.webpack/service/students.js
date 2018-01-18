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

/*
  show the users that is enrolled in a courseId
  TODO: somehow contact cognito federated identity, and gleam user id from there
*/
var main = exports.main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(event, context, callback) {
    var params, result;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            params = {
              TableName: "enrolment",
              IndexName: 'courseId-index',
              // 'KeyConditionExpression' defines the condition for the query
              // - 'userId = :userId': only return items with matching 'userId'
              //   partition key
              // 'ExpressionAttributeValues' defines the value in the condition
              // - ':userId': defines 'userId' to be Identity Pool identity id
              //   of the authenticated user
              KeyConditionExpression: "courseId = :courseId",
              ExpressionAttributeValues: {
                ":courseId": event.pathParameters.id
              }
            };
            _context.prev = 1;
            _context.next = 4;
            return dynamoDbLib.call("query", params);

          case 4:
            result = _context.sent;

            console.log('result.Items', result.Items);

            // Return the matching list of items in response body

            if (!(result.Items.length > 0)) {
              _context.next = 9;
              break;
            }

            _context.next = 9;
            return updateMeta(result);

          case 9:
            ;

            //wait 5s
            console.log('wait 2s');
            _context.next = 13;
            return new _promise2.default(function (resolve) {
              return setTimeout(resolve, 2000);
            });

          case 13:

            callback(null, (0, _responseLib.success)(result.Items));
            _context.next = 20;
            break;

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](1);

            console.log(_context.t0);
            callback(null, (0, _responseLib.failure)({ status: false }));

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[1, 16]]);
  }));

  return function main(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var updateMeta = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(result) {
    var _this = this;

    var userQueryParams, userQueryResults, identSrv, userPoolId;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            console.log('asking cognto identity pool for more info');
            //should get further user info, like name, email, etc
            userQueryParams = {
              RequestItems: {
                'identLookUp': {
                  Keys: result.Items.map(function (e, i) {
                    return { identityId: e.userId };
                  })
                }
              }

              //attempt to retrieve user id
            };
            userQueryResults = null;
            _context3.prev = 3;

            console.log('attempt to get username from identityId');
            _context3.next = 7;
            return dynamoDbLib.call('batchGet', userQueryParams);

          case 7:
            userQueryResults = _context3.sent;
            _context3.next = 16;
            break;

          case 10:
            _context3.prev = 10;
            _context3.t0 = _context3["catch"](3);

            console.log('error getting username from identityId');
            console.error(_context3.t0);
            callback(null, (0, _responseLib.failure)({ status: false }));
            return _context3.abrupt("return");

          case 16:
            ;

            if (userQueryResults.Responses.identLookUp) {
              _context3.next = 19;
              break;
            }

            return _context3.abrupt("return");

          case 19:
            ;

            identSrv = new _awsSdk2.default.CognitoIdentityServiceProvider({ region: 'ap-southeast-1' });
            userPoolId = 'ap-southeast-1_SDZuB7De0';

            /*
              this part get's left behind, wrap this into a promise !!??
            */

            console.log('attempt to add metadata to each user enrolment data');
            //cycle throught the userQueryParams, but somehow, doesn't wait for everything to finish
            _context3.next = 25;
            return userQueryResults.Responses.identLookUp.forEach(function () {
              var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(elm) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        console.log("looking up attributes for " + elm.username + " / " + elm.identityId);
                        _context2.next = 3;
                        return identSrv.adminGetUser({ UserPoolId: userPoolId, Username: elm.username }, function (err, data) {
                          if (err) {
                            console.log('error looking up');
                            console.err(err);
                          } else {
                            var findResult = result.Items.find(function (resultElm) {
                              return resultElm.userId === elm.identityId;
                            });
                            console.log('findResult', findResult);
                            findResult['userMeta'] = data;
                            console.log('result', result);
                          };
                        });

                      case 3:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2, _this);
              }));

              return function (_x5) {
                return _ref3.apply(this, arguments);
              };
            }());

          case 25:

            console.log('result inside updateMeta', result);

            return _context3.abrupt("return", result);

          case 27:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[3, 10]]);
  }));

  return function updateMeta(_x4) {
    return _ref2.apply(this, arguments);
  };
}();

var userMetaLookUp = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(username) {
    var identSrv, userPoolId, result;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            identSrv = new _awsSdk2.default.CognitoIdentityServiceProvider({ region: 'ap-southeast-1' });
            userPoolId = 'ap-southeast-1_SDZuB7De0';
            _context4.prev = 2;

            console.log("getting user attributes for " + username);
            _context4.next = 6;
            return identSrv.adminGetUser({ UserPoolId: userPoolId, Username: username }, function (err, data) {
              if (err) {
                console.log('error getting user attributes');
                console.error(err);
                return false;
              } else {
                //update the result w/ user meta data
                console.log(data);
                result = data;
                return data;
              };
            });

          case 6:
            _context4.next = 13;
            break;

          case 8:
            _context4.prev = 8;
            _context4.t0 = _context4["catch"](2);

            console.log('lookup Error');
            console.error(_context4.t0);
            return _context4.abrupt("return", false);

          case 13:

            console.log('result', result);
            return _context4.abrupt("return", result);

          case 15:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[2, 8]]);
  }));

  return function userMetaLookUp(_x6) {
    return _ref4.apply(this, arguments);
  };
}();

var _dynamodbLib = __webpack_require__(5);

var dynamoDbLib = _interopRequireWildcard(_dynamodbLib);

var _responseLib = __webpack_require__(6);

var _awsSdk = __webpack_require__(0);

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;

;

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
exports.call = call;

var _awsSdk = __webpack_require__(0);

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk2.default.config.update({ region: "ap-southeast-1" });

function call(action, params) {
  var dynamoDb = new _awsSdk2.default.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
}

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
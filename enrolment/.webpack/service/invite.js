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

var _asyncToGenerator2 = __webpack_require__(3);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/*
  invite people to the course for enrollment
  * required:-
    body.inviteList = names and email to be invited
    body.meta = constains meta info like course_owner (saving a lookup)
    pathParameters.id = the courseId to be included
  * plan: -
    use sendgrid to send the emails
*/
var main = exports.main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(event, context, callback) {
    var body, params, result, createParams, personalize, msg;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            body = JSON.parse(event.body);

            //get course info, description, etc

            params = {
              TableName: 'courses',
              Key: { courseId: event.pathParameters.id }
            };
            result = null;
            _context.prev = 3;
            _context.next = 6;
            return dynamoDbLib.call('get', params);

          case 6:
            result = _context.sent;

            if (result.Item) {
              _context.next = 10;
              break;
            }

            callback(null, (0, _responseLib.failure)({ status: false, error: "Item not found." }));
            return _context.abrupt("return");

          case 10:
            _context.next = 18;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](3);

            console.log('error getting course info');
            console.log(_context.t0);
            callback(null, (0, _responseLib.failure)({ status: false, error: "Error getting course info." }));
            return _context.abrupt("return");

          case 18:

            //add the emails info in the enrolment table
            /*
              just add the email addresses as the userId so other people being invited for the course would know
            */
            createParams = {
              RequestItems: {
                'enrolment': body.inviteList.map(function (e, i) {
                  return {
                    PutRequest: {
                      Item: {
                        'userId': e.email,
                        'courseId': event.pathParameters.id,
                        'createdAt': Date.now(),
                        'progress': [],
                        'status': 'invited'
                      }
                    }
                  };
                })
              }
            };
            _context.prev = 19;
            _context.next = 22;
            return dynamoDbLib.call('batchWrite', createParams);

          case 22:
            _context.next = 30;
            break;

          case 24:
            _context.prev = 24;
            _context.t1 = _context["catch"](19);

            console.log('error creating enrolment');
            console.log(_context.t1);
            callback(null, (0, _responseLib.failure)({ status: false, error: "Unable to create enrolment items." }));
            return _context.abrupt("return");

          case 30:
            //setup personalization for each recipient
            personalize = body.inviteList.map(function (e, i) {
              return {
                key: i,
                to: { email: e.email, name: e.name },
                substitutions: { invitee: e.name }
              };
            });

            //now actually send the email

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            sgMail.setSubstitutionWrappers('{{', '}}'); // Configure the substitution tag wrappers globally
            msg = {
              from: {
                name: 'learn@AP',
                email: 'learn@actuarialpartners.com'
              },
              templateId: 'f927fce9-07fe-48ac-853e-5f9421d51889',
              personalizations: personalize,
              substitutions: {
                course_name: result.Item.name,
                course_owner: body.meta.course_owner,
                course_description: result.Item.description,
                course_url: "https://bazinga.actuarialpartners.com/courses/promo/" + event.pathParameters.id
              }
            };


            sgMail.send(msg).then(function () {
              console.log('successfully sent emails');
              callback(null, (0, _responseLib.success)({ msg: 'success' }));
            }).catch(function (err) {
              console.log('error sending mails');
              console.log(err.toString());
              callback(null, (0, _responseLib.failure)({ status: false, error: "error sending emails" }));
            });

            /*
              send emails to everyone in the inviteList w/ the inviteMessage about
              pathParameters.id course
            */

            /*
              add the people in the invite list to the enrolment table
                if the emails are not in federated identity, then save as email,
                so it'd be converted into federated identity as the user logs in
            */

            /*
              currently, can only send to verified addresses due to AWS default sending limit.
              already requested to update the limits on 19/2/2018, we'll see what will happens next.
            */
            return _context.abrupt("return");

          case 36:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 12], [19, 24]]);
  }));

  return function main(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var _responseLib = __webpack_require__(4);

var _awsSdk = __webpack_require__(0);

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _dynamodbLib = __webpack_require__(6);

var dynamoDbLib = _interopRequireWildcard(_dynamodbLib);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sgMail = __webpack_require__(7);

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/regenerator");

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

var _stringify = __webpack_require__(5);

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
/* 5 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/json/stringify");

/***/ }),
/* 6 */
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
/* 7 */
/***/ (function(module, exports) {

module.exports = require("@sendgrid/mail");

/***/ })
/******/ ])));
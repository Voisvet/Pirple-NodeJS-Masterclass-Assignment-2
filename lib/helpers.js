/*
 * Helpers for varioua tasks
 *
 */

// Dependencies
const crypto = require('crypto');
const querystring = require('querystring');
const https = require('https');

const config = require('../config');

// Container for library
var helpers = {};


// Create a SHA256 hash
helpers.hash = function(str) {
  if (typeof(str) == 'string' && str.length > 0) {
    var hash = crypto.createHmac('sha256', config.hashSecret)
            .update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse JSON without throwing parsing exceptions
helpers.parseJsonToObject = function(str) {
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch(e) {
    return {};
  }
}

// Create a random string with given length
helpers.createRandomString = function(strLength) {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all the possible characters for the string
    var possibleCharacters = 'qwertyuiopasdfghjklzxcvbnm1234567890';

    var str = '';

    for (i = 0; i < strLength; i++) {
      // Get a random character from possible characters
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random()
              * possibleCharacters.length));
      // Append given character
      str += randomCharacter;
    }

    return str;
  } else {
    return false;
  }
}

// Send an SMS via twilio
helpers.sendTwilioSms = function(phone, msg, callback) {
  // Validate parameters
  phone = typeof(phone) == 'string' &&
          phone.trim().length == 10 ?
          phone.trim() : false;
  msg = typeof(msg) == 'string' &&
          msg.trim().length > 0 &&
          msg.trim().length <= 1600 ?
          msg.trim() : false;
  if (phone && msg) {
    // Configure message payload
    var payload = {
      'From': config.twilio.fromPhone,
      'To': config.twilio.countryCode + phone,
      'Body': msg
    };

    // Stringify the payload
    var stringPayload = querystring.stringify(payload);

    // Configure the request details
    var requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.twilio.com',
      'method': 'POST',
      'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails, function(res) {
      // Grab the status of the sent request
      var status = res.statusCode;
      // Callback if the request is successfull
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback('Statuscode returned was ' + status);
      }
    });

    // Bind to the error event so it does not get thrown
    req.on('err', function(e) {
      callback(e);
    });

    // Add the payload to the request
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or invalid');
  }
}


// Export the module
module.exports = helpers;

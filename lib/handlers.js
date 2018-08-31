/*
 *
 * Request handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('../config');

// Container for the module
var handlers = {};

// Functions

// Users handler
handlers.users = (data, callback) => {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -10) {
    handlers._users[data.method](data, callback);
  } else {
    callback(404);
  }
};

// Container for the users submethods
handlers._users = {};

// Users - POST
// Required data: name, email, streetAddress, password
// Optional data: none
handlers._users.post = (data, callback) => {
  // Check validity of required fields
  var name = typeof(data.payload.name) == 'string' &&
          data.payload.name.trim().length > 0 ?
          data.payload.name.trim() : false;
  var email = typeof(data.payload.email) == 'string' &&
          data.payload.email.trim().length > 0 ?
          data.payload.email.trim() : false;
  var streetAddress = typeof(data.payload.streetAddress) == 'string' &&
          data.payload.streetAddress.trim().length > 0 ?
          data.payload.streetAddress.trim() : false;
  var password = typeof(data.payload.password) == 'string' &&
          data.payload.password.trim().length > 0 ?
          data.payload.password.trim() : false;

  if (name, email, streetAddress, password) {
    // Make sure that user does not already exist
    _data.read('users', email, (err, data) => {
      if (err) {
        // Hash the password
        var hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // Create a user object
          var userObject = {
            'name': name,
            'email': email,
            'streetAddress': streetAddress,
            'hashedPassword': hashedPassword
          };

          // Store the data
          _data.create('users', email, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {'Error': 'Could not create a user'});
            }
          });
        } else {
          callback(500, {'Error': 'Could not hash the password'});
        }
      } else {
        callback(400, {'Error': 'User with this e-mail address already exists'});
      }
    });
  }  else {
    callback(400, {'Error': 'Missing required fields'});
  }
};

handlers.notFound = (data, callback) => {
  callback(404);
};

// Export the module
module.exports = handlers;

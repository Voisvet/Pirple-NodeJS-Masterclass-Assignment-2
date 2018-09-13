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

// Users - GET
// Required data: email
// Optional data: none
// @TODO Implement authentification
handlers._users.get = (data, callback) => {
  // Check validity of the required fields
  var email = typeof(data.queryStringParameters.email) == 'string' &&
          data.queryStringParameters.email.trim().length > 0 ?
          data.queryStringParameters.email.trim() : false;

  if (email) {
    // Get data from file
    _data.read('users', email, (err, userData) => {
      if (!err && userData) {
        // Return data without hashed password
        delete userData.hashedPassword;
        callback(200, userData);
      } else {
        callback(400, {'Error': 'User with specified e-mail does not exist'});
      }
    });
  } else {
    callback(400, {'Error': 'Missing required fields'});
  }
}

// Users - PUT
// Required data: email
// Optional data: name, streetAddress, password
// @TODO Implement authentification
handlers._users.put = (data, callback) => {
  // Check validity of required field
  var email = typeof(data.payload.email) == 'string' &&
          data.payload.email.trim().length > 0 ?
          data.payload.email.trim() : false;

  // Check validity of optional fields
  var name = typeof(data.payload.name) == 'string' &&
          data.payload.name.trim().length > 0 ?
          data.payload.name.trim() : false;
  var streetAddress = typeof(data.payload.streetAddress) == 'string' &&
          data.payload.streetAddress.trim().length > 0 ?
          data.payload.streetAddress.trim() : false;
  var password = typeof(data.payload.password) == 'string' &&
          data.payload.password.trim().length > 0 ?
          data.payload.password.trim() : false;

  if (email) {
    if (name || streetAddress || password) {
      // Get the user data
      _data.read('users', email, (err, userData) => {
        if (!err && userData) {
          // Update fields
          if (name) userData.name = name;
          if (streetAddress) userData.streetAddress = streetAddress;
          if (password) userData.hashedPassword = helpers.hash(password);

          // Store user data to disk
          _data.update('users', email, userData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {'Error': 'Could not update the user'});
            }
          });
        } else {
          callback(400, {'Error': 'User with specified e-mail does not exist'});
        }
      });
    } else {
      callback(400, {'Error': 'Missing fields to update'});
    }
  } else {
    callback(400, {'Error': 'Missing required field'});
  }
};

// Users - PUT
// Required data: email
// Optional data: none
// @TODO Implement authentification
// @TODO Cleanup all the user's files and tokens
handlers._users.delete = (data, callback) => {
  // Check validity of the required field
  var email = typeof(data.queryStringParameters.email) == 'string' &&
          data.queryStringParameters.email.trim().length > 0 ?
          data.queryStringParameters.email.trim() : false;

  if (email) {
    // Ensure that user exists
    _data.read('users', email, (err, userData) => {
      if (!err && userData) {
        // Delete the user
        _data.delete('users', email, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, {'Error': 'Could not delete the user'});
          }
        });
      } else {
        callback(400, {'Error': 'User with specified e-mail does not exist'});
      }
    });
  } else {
    callback(400, {'Error': 'Missing required field'});
  }
};

handlers.notFound = (data, callback) => {
  callback(404);
};


// Tokens handler
handlers.tokens = (data, callback) => {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -10) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(404);
  }
};

// Tokens container
handlers._tokens = {};

// Tokens - POST
// Required data: email, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  // Check passed data
  var email = typeof(data.payload.email) == 'string' &&
          data.payload.email.trim().length > 0 ?
          data.payload.email.trim() : false;
  var password = typeof(data.payload.password) == 'string' &&
          data.payload.password.trim().length > 0 ?
          data.payload.password.trim() : false;

  if (email && password) {
    // Get data of user
    _data.read('users', email, (err, data) => {
      if (!err && data) {
        // Check password
        var hashedPassword = helpers.hash(password);
        if (data.hashedPassword == hashedPassword) {
          // Create token
          var tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            'email': email,
            'id': tokenId,
            'expires': expires
          };
          // Save token to disk
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, {'Error': 'Could not save token to disk'});
            }
          });
        } else {
          callback(400, {'Error': 'Wrong password'});
        }
      } else {
        callback(400, {'Error': 'Could not find the user'});
      }
    });
  } else {
    callback(400, {'Error': 'Missing required fields'});
  }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
  // Check passed data
  var id = typeof(data.payload.id) == 'string' &&
          data.payload.id.trim().length > 0 ?
          data.payload.id.trim() : false;
  var extend = typeof(data.payload.extend) == 'boolean' ?
          data.payload.extend : false;

  if (id && extend) {
    // Get token data
    _data.read('tokens', id, (err, tokenObject) => {
      if (!err && tokenObject) {
        // Check validity of token
        if (tokenObject.expires > Date.now()){
          // Prolongate token for 1 hour
          tokenObject.expires = Date.now() + 3600000;
          _data.update('tokens', id, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, {'Error': 'Could not update the data'});
            }
          });
        } else {
          callback(400, {'Error': 'Token has already expired and cannot be extended'});
        }
      } else {
        callback(400, {'Error': 'Specified token does not exist'});
      }
    });
  } else {
    callback(400, {'Error': 'Missing required fields or fields are invalid'});
  }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
  // Check passed date
  var id = typeof(data.queryStringParameters.id) == 'string' &&
          data.queryStringParameters.id.trim().length > 0 ?
          data.queryStringParameters.id.trim() : false;

  if (id) {
    // Get token data
    _data.read('tokens', id, (err, tokenObject) => {
      if (!err && tokenObject) {
        callback(200, tokenObject);
      } else {
        callback(404, {'Error': 'Could not find specified token'});
      }
    });
  } else {
    callback(400, {'Error': 'Missing required field'})
  }
};
// Export the module
module.exports = handlers;

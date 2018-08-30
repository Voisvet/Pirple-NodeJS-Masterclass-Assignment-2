/*
 * Library for storing and editing data
 *
 */

// Dependencies
const fs = require('fs');
const path = require('path');

const helpers = require('./helpers');

// Container for the module to be exported
var lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = function(dir, file, data, callback) {
  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function(err, fileDesc) {
    if (!err && fileDesc) {
      // Convert data to a stringi
      var stringData = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(fileDesc, stringData, function(err) {
        if (!err) {
          fs.close(fileDesc, function(err) {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing new file');
            }
          })
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file. Probably it already exist.');
    }
  });
};

// Read data from a file
lib.read = function(dir, file, callback) {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8',
          function(err, data) {
    if (!err && data) {
      var parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

// Update data in a file
lib.update = function(dir, file, data, callback) {
  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function(err, fileDesc) {
    if (!err && fileDesc) {
      // Convert data to string
      var stringData = JSON.stringify(data);

      // Truncate the file
      fs.truncate(fileDesc, function(err) {
        if (!err) {
          // Write to file and close it
          fs.writeFile(fileDesc, stringData, function(err) {
            if (!err) {
              fs.close(fileDesc, function(err) {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing file');
                }
              });
            } else {
                callback('Error writing data to the file.')
            }
          });
        } else {
          callback('Error truncating file.');
        }
      });
    } else {
      callback('Could not open the file for updating. Probably it does not exist.');
    }
  });
};

// Delete a file
lib.delete = function(dir, file, callback) {
  // Unlink the file
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', function(err) {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting the file.');
    }
  });
}

// List all the files in a directory
lib.list = function(directory, callback) {
  fs.readdir(lib.baseDir + directory + '/', function(err, data) {
    if (!err && data && data.length > 0) {
      var trimmedFileNames = [];
      data.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace('.json', ''));
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};


// Export the module
module.exports = lib;

/*
 *
 * Server part of the project
 *
 */

// Dependencies
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const helpers = require('./helpers');


// Container for lib
var server = {};

// Functions

// All the server logic
server.serverFunction = (req, res) => {
  // Get url and parse it
  var parsedURL = url.parse(req.url, true);

  // Get path and trim it
  var path = parsedURL.pathname.replace(/^\/+|\/+$/g, "");

  // Get HTTP method
  var method = req.method.toLowerCase();

  // Get payload, if there is any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', (data) => buffer += decoder.write(data));
  req.on('end', (data) => {
    buffer += decoder.end();
    // Choose the handler to process request
    // If no one found, use 404 handler
    // @TODO Implement not found handler
    var chosenHandler = typeof(server.router[path]) !== 'undefined' ?
            server.router[path] : (data) => {};

    // Construct the data object for passing to the handler
    var data = {
      'path': path,
      'queryStringParameters': parsedURL.query,
      'method': method,
      'headers': req.headers,
      'payload': helpers.parseJsonToObject(buffer)
    };

    // Route request to the handler
    chosenHandler(data, (statusCode, payload) => {
      // Use given status code or set it to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use given payload or an empty object as a default one
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert a payload to a string
      var payloadString = JSON.stringify(payload);

      // Send the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the status
      console.log('Get request on ' + path + ' with method ' + method);
      console.log('Return response with code', statusCode);
    });

  });
};

// Prepare server options for HTTPS server
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

// Instantiate the HTTP and HTTPS servers
server.httpServer = http.createServer(server.serverFunction);
server.httpsServer = https.createServer(server.httpsServerOptions, server.serverFunction);

// Define a request router
server.router = {

};

// Initialization of the server
server.init = () => {
  // Start the HTTP server
  server.httpServer.listen(3000, () => {
    console.log('The HTTP server is listening on port', 3000);
  });

  // Start the HTTPS server
  server.httpsServer.listen(3001, () => {
    console.log('The HTTPS server is listening on port', 3001);
  });
};


// Export the module

module.exports = server;

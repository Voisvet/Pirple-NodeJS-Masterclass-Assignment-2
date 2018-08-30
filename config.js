/*
 *
 * Configs for the server
 *
 */

// Container for all the environments
var environments = {};

// Debug configuration
environments.debug = {
  'envName': 'debug',
  'httpPort': 8080,
  'httpsPort': 8081,
  'hashSecret': 'thisIsASecret'
};

// Production configuration
environments.production = {
  'envName': 'production',
  'httpPort': 80,
  'httpsPort': 443,
  'hashSecret': 'zjfbe654wgj7i4g'
};

// Determine requested in command line environment
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ?
        process.env.NODE_ENV.toLowerCase() : '';

// Take chosen environment from the object or take default one
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ?
        environments[currentEnvironment] : environments.debug;

// Export the module
module.exports = environmentToExport;

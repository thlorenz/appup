'use strict';

var restify = require('restify');

function initApi (customInit) {
  var apiApp = restify.createServer();

  customInit(apiApp, restify);
  return apiApp;
}

/**
 * Starts up API server.
 * 
 * @name exports
 * @function
 * @param customInit {Function} a custom app server initialization function that is called before server starts listening
 * @param port {Number} the port at which the server should listen
 * @param cb {Function} called when server started listening
 */
var go = module.exports = function startApi (customInit, port, cb) {
  var apiApp = initApi(customInit);
  var apiServer = apiApp.listen(port);

  apiServer.once('listening', function () {
    var address = apiServer.address();
    cb(null, address);
  });
};
'use strict';

var restify = require('restify');

function initApi (customInit) {
  var apiApp = restify.createServer();

  customInit(apiApp, restify);
  return apiApp;
}

function postInitApi (apiApp, apiServer, customPostInit) {
  customPostInit(apiApp, apiServer, restify);
}

/**
 * Starts up API server.
 * 
 * @name startApi
 * @private
 * @function
 * @param customInit {Function} a custom app server initialization function that is called before server starts listening
 * @param customPostInit {Function} a custom app server initialization function that is called after server starts listening
 * @param port {Number} the port at which the server should listen
 * @param cb {Function} called when server started listening
 */
var go = module.exports = function startApi (customInit, customPostInit, port, cb) {
  var apiApp = initApi(customInit);
  var apiServer = apiApp.listen(port);

  apiServer.once('listening', function () {
    var address = apiServer.address();
    
    postInitApi(apiApp, apiServer, customPostInit);
    cb(null, address);
  });
};

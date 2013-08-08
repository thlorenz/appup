'use strict';

var express = require('express');
  
function initPages (bfy, bundleOpts, customInit, apiServerInfo) {
  var pagesApp = express();

  customInit(pagesApp, express, apiServerInfo);

  pagesApp.get('/build.js', function(req, res) {
    res.contentType('application/javascript');
    bfy.bundle(bundleOpts, function(err, src) {
      if (err) {
        console.error(err);
        return res.send(500);
      }
      res.end(src);
    });
  });
  return pagesApp;
}

/**
 * Creates browserify bundle, adds a route for the client to obtain it and starts up pages server
 * 
 * @name exports
 * @function
 * @param bfy {Object} browserify instance
 * @param bundleOpts {Object} options to be passed to browserify.bundle()
 * @param customInit {Function} a custom app server initialization function that is called before server starts listening
 * @param port {Number} the port at which the server should listen
 * @param apiServerInfo {Object} address info about the api server to be passed to custom init function
 * @param cb {Function} called when server started listening
 */
var go = module.exports = function startPages (bfy, bundleOpts, customInit, port, apiServerInfo, cb) {
  
  var pagesApp = initPages(bfy, bundleOpts, customInit, apiServerInfo);
  var pagesServer = pagesApp.listen(port);

  pagesServer.once('listening', function() {
    var address = pagesServer.address();
    if (cb) cb(null, address); 
  });
};

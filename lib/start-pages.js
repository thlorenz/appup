'use strict';

var express = require('express');

function sendError(res, err) {
  /* global document */
  res.end('('+function errored(error) {
    if(!document.body) {
      return document.addEventListener('DOMContentLoaded', function() {
        errored(error);
      });
    }

    var pre = document.createElement('pre');
    pre.setAttribute(
      "style", 
      "font-size: 20px; color: yellowgreen; background: #111; border-radius: 5px; margin: 10px; padding: 5px"
    );
    pre.textContent = error;

    document.body.children.length ?
      document.body.insertBefore(pre, document.body.children[0]) :
      document.body.appendChild(pre);
  }+'('+JSON.stringify(err.stack)+'))');
}
  
function initPages (bfy, bundleOpts, customInit, apiServerInfo, events) {
  var pagesApp = express();

  customInit(pagesApp, express, apiServerInfo);

  pagesApp.get('/build.js', function(req, res) {
    res.contentType('application/javascript');
    bfy
      .bundle(bundleOpts)
      .on('error', function(err) {
        if (events) events.emit('error', err); else console.error(err);
        sendError(res, err);
      })
      .pipe(res);
  });
  return pagesApp;
}

function postInitPages (pagesApp, pagesServer, customPostInit, apiServerInfo) {
  customPostInit(pagesApp, pagesServer, express, apiServerInfo);
}

/**
 * Creates browserify bundle, adds a route for the client to obtain it and starts up pages server
 * 
 * @name exports
 * @function
 * @private
 * @param {Object} bfy browserify instance
 * @param {Object} bundleOpts options to be passed to browserify.bundle()
 * @param {Function} customInit a custom app server initialization function that is called before the server starts listening
 * @param {Function} customPostInit a custom app server initialization function that is called after the server starts listening
 * @param {Number} port the port at which the server should listen
 * @param {Object} apiServerInfo address info about the api server to be passed to custom init function
 * @param {EventEmitter=} events on which errors will be triggered if they are passed, otherwise errors are logged
 * @param cb {Function} called when server started listening
 */
var go = module.exports = function startPages (bfy, bundleOpts, customInit, customPostInit, port, apiServerInfo, events, cb) {
  
  var pagesApp = initPages(bfy, bundleOpts, customInit, apiServerInfo, events);
  var pagesServer = pagesApp.listen(port);
  postInitPages(pagesApp, pagesServer, customPostInit, apiServerInfo);

  pagesServer.once('listening', function() {
    var address = pagesServer.address();
    if (cb) cb(null, address); 
  });
};

'use strict';

var dynamicDedupe = require('dynamic-dedupe');

var path = require('path');
var optimist = require('optimist');
var browserify = require('browserify');

var startPages = require('./lib/start-pages');
var startApi = require('./lib/start-api');

/**
 * Creates browserify bundle and starts up pages server and/or api server according to the supplied options.
 *
 * If no api port is given, the api server is not started up.
 * If no pages port is given, the pages server is not started up.
 * If neither port is given, an error is thrown.
 * 
 * @name appup
 * @function
 * @param opts {Object} 
 * @param {number}  opts.pages:   port at which to start up pages server (optional)
 * @param {number}  opts.api:     port at which to start up api server (optional)
 * @param {string}  opts.config:  full path configuration provided to override browserify specific options and/or custom API/Pages servers init functions
 * @param {string}  opts.entry:   entry file to add to browserify
 * @param {boolean} opts.dedupe:  turns on dynamic-dedupe
 */
var go = module.exports = function appup(opts) {

  // ensure to turn dedupe on BEFORE requiring the entry
  if (opts.dedupe) dynamicDedupe.activate(); 

  var config    =  opts.config ? require(opts.config) : {};
  var pagesPort =  opts.pagesPort;
  var apiPort   =  opts.apiPort;
  var entry     =  opts.entry;

  if (!pagesPort && !apiPort) throw new Error('Need to pass either pages or api port in order for me to start an app');

  var bfy = config.initBrowserify ? config.initBrowserify(browserify) : browserify();
  var bundleOpts = config.bundleOpts || { insertGlobals: true, debug: true };

  var initPages     =  config.initPages     || function () {};
  var postInitPages =  config.postInitPages || function () {};
  var initApi       =  config.initApi       || function () {};
  var postInitApi   =  config.postInitApi   || function () {};
  var events        =  config.events        || null;

  bfy.require(entry, { entry: true });

  function maybeStartPages (apiServerInfo) {
    if (pagesPort) {
      startPages(bfy, bundleOpts, initPages, postInitPages, pagesPort, apiServerInfo, events, function (err, address) {
        var port = address.port;
        var msg = 'pages server listening: http://localhost:' + port;
        if(events) events.emit('info', msg); else console.log(msg);
      });
    }
  }

  // api server needst to be started before pages server in order to provide api server location to the latter
  if (apiPort) { 
    startApi(initApi, postInitApi, apiPort, function (err, address) {
      if (err) return events ? events.emit('error', err) : console.error(err);

      var port = address.port;
      var msg = 'api server listening: http://localhost:' + port;
      if(events) events.emit('info', msg); else console.log(msg);
      maybeStartPages({ address: address });
    });
  } else {
    maybeStartPages(null);
  }
};

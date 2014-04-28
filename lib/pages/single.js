'use strict';

var EE                 = require('events').EventEmitter
  , propagateEvents    = require('../propagate-events')
  , startPages           = require('./start')
  , serverErrorHandler = require('../single-server-error-handler')

var dynamicDedupe = require('dynamic-dedupe');
var browserify = require('browserify');

var go = module.exports = 

function (opts) {
  
  // ensure to turn dedupe on BEFORE requiring the entry
  if (opts.dedupe) dynamicDedupe.activate(); 

  var apiServerInfo =  { host: opts.apiHost, port: opts.apiPort };
  var pagesPort     =  opts.pagesPort;
  var entry         =  opts.entry;
  var config        =  opts.config ? require(opts.config) : {};

  var bfy = config.initBrowserify ? config.initBrowserify(browserify) : browserify();
  var bundleOpts = config.bundleOpts || { insertGlobals: true, debug: true };

  var initPages     =  config.initPages     || function () {};
  var postInitPages =  config.postInitPages || function () {};
  var events        =  config.events        || null;
  var send500       =  config.pagesSend500; // domain-middleware has default for this

  var localEvents = new EE();
  propagateEvents(localEvents, events);

  bfy.require(entry, { entry: true });

  var onServerError   = serverErrorHandler(events)
    , onFatalError    = onServerError.bind(null, true)
    , onNonFatalError = onServerError.bind(null, false)

  startPages(
      { bfy            :  bfy
      , bundleOpts     :  bundleOpts
      , customInit     :  initPages
      , customPostInit :  postInitPages
      , port           :  pagesPort
      , apiServerInfo  :  apiServerInfo
      , watchdir       :  opts.watchdir
      , events         :  localEvents
      , send500        :  send500
      }
    , function (err, address) {
        var port = address.port;
        var msg = 'pages server listening: http://localhost:' + port;
        localEvents.emit('info', msg);    
        localEvents.on('server-error', onNonFatalError);
        localEvents.on('fatal-error', onFatalError);
      }
  );
};

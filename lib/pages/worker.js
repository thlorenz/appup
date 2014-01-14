'use strict';

var EE = require('events').EventEmitter
  , cluster = require('cluster')
  , serverErrorHandler = require('../server-error-handler')
  , propagateEvents = require('../propagate-events')
  , killTimeout = 30000;

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

var dynamicDedupe = require('dynamic-dedupe');
var browserify = require('browserify');

var startPages = require('./start');

(function startWorker() {

var opts;
try { 
  if (!process.env.appup_pages_worker_opts) throw new Error('appup_pages_worker_opts missing');
  opts = JSON.parse(process.env.appup_pages_worker_opts);
} catch (e) {
  console.error(e);
  inspect(process.env.appup_pages_worker_opts)
  return;
}
inspect(opts);

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

var localEvents = new EE();
propagateEvents(localEvents, events);

bfy.require(entry, { entry: true });

var onServerError = serverErrorHandler(cluster, localEvents, killTimeout);

startPages(
    { bfy            :  bfy
    , bundleOpts     :  bundleOpts
    , customInit     :  initPages
    , customPostInit :  postInitPages
    , port           :  pagesPort
    , apiServerInfo  :  apiServerInfo
    , watchdir       :  opts.watchdir
    , events         :  localEvents
    }
  , function (err, address) {
      var port = address.port;
      var msg = 'pages server listening: http://localhost:' + port;
      localEvents.emit('info', msg);    
      localEvents.on('server-error', onServerError.bind(null, false));
      localEvents.on('fatal-error', onServerError.bind(null, true));
    }
);

})();

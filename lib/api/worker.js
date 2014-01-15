'use strict';

var EE                 = require('events').EventEmitter
  , cluster            = require('cluster')
  , serverErrorHandler = require('../server-error-handler')
  , propagateEvents    = require('../propagate-events')
  , killTimeout        = 30000;

var startApi = require('./start');

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

(function startWorker() {

var opts;
try { 
  if (!process.env.appup_api_worker_opts) throw new Error('appup_api_worker_opts missing');
  opts = JSON.parse(process.env.appup_api_worker_opts);
} catch (e) {
  console.error(e);
  inspect(process.env.appup_api_worker_opts)
  return;
}

var apiPort = opts.apiPort;

var config = opts.config ? require(opts.config) : {};

var initApi     = config.initApi     || function () {};
var postInitApi = config.postInitApi || function () {};
var events      = config.events      || null;
var send500     = config.apiSend500; // domain-middleware has default for this

var localEvents = new EE();
propagateEvents(localEvents, events);

var onServerError   = serverErrorHandler(cluster, events, killTimeout)
  , onFatalError    = onServerError.bind(null, true)
  , onNonFatalError = onServerError.bind(null, false)

startApi(
    { customInit     : initApi
    , customPostInit : postInitApi
    , port           : apiPort
    , events         : localEvents
    , send500        : send500
    }
  , function (err, address) {
      var port = address.port;
      var msg = 'api server listening: http://localhost:' + port;
      localEvents.emit('info', msg);    
      localEvents.on('server-error', onNonFatalError);
      localEvents.on('fatal-error', onFatalError);
    }
);

})();

'use strict';
var EE                 = require('events').EventEmitter
  , propagateEvents    = require('../propagate-events')
  , startApi           = require('./start')
  , serverErrorHandler = require('../single-server-error-handler')

var go = module.exports = 

/**
 * Launches only a single instance of the API server and should only be used in development.
 * In production cluster should be used to launch at least two in order to be able
 * to restart one in case a server error occurs.
 * 
 * @name single
 * @private
 * @function
 * @param {Object} opts  various api server options
 */
function single (opts) {
  
  var apiPort = opts.apiPort;

  var config = opts.config ? require(opts.config) : {};

  var initApi     = config.initApi     || function () {};
  var postInitApi = config.postInitApi || function () {};
  var events      = config.events      || null;
  var send500     = config.apiSend500; // domain-middleware has default for this

  var localEvents = new EE();
  propagateEvents(localEvents, events);

  var onServerError   = serverErrorHandler.bind(null, events)
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
};

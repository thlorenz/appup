'use strict';

var restify = require('restify')
  , domainMiddleware = require('../domain-middleware');

function initApi (customInit, send500) {
  var apiApp = restify.createServer();

  var domainMw = domainMiddleware(send500);
  apiApp.use(domainMw.middleware);

  customInit(apiApp, restify);
  return { domainMw: domainMw, apiApp: apiApp };
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
 * @param {Object}        opts
 * @param {Function}      opts.customInit     a custom app server initialization function that is called before server starts listening
 * @param {Function}      opts.customPostInit a custom app server initialization function that is called after server starts listening
 * @param {Function=}     opts.send500        function that is invoked with `(req, res)` when a server error occurs
 * @param {number}        opts.port           the port at which the server should listen
 * @param {EventEmitter}  opts.events         on which errors will be triggered if they are passed, otherwise errors are logged
 * @param {Function} cb called when server started listening
 */
var go = module.exports = function startApi (opts, cb) {
  var inited = initApi(opts.customInit, opts.send500);
  var apiApp = inited.apiApp;
  var domainMw = inited.domainMw;

  var apiServer = apiApp.listen(opts.port);

  domainMw.server = apiServer;

  domainMw.events.on('server-error', opts.events.emit.bind(opts.events, 'server-error'));
  domainMw.events.on('fatal-error', opts.events.emit.bind(opts.events, 'fatal-error'));

  apiServer.once('listening', function () {
    var address = apiServer.address();
    
    postInitApi(apiApp, apiServer, opts.customPostInit);
    cb(null, address);
  });
  return apiServer;
};

'use strict';

var express    =  require('express')
  , format     =  require('util').format
  , liveReload =  require('./live-reload')
  , domainMiddleware = require('../domain-middleware');

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
      "font-size: 20px; font-family: helvetica; line-height: 25px; " +
      "color: yellowgreen; background: #111; border-radius: 5px; margin: 10px; padding: 5px"
    );
    pre.textContent = error;

    document.body.children.length ?
      document.body.insertBefore(pre, document.body.children[0]) :
      document.body.appendChild(pre);
  }+'('+JSON.stringify(err.stack)+'))');
}
  
function initPages (opts) {
  var pagesApp = express();

  var domainMw = domainMiddleware(opts.send500);
  pagesApp.use(domainMw.middleware);

  opts.customInit(pagesApp, express, opts.apiServerInfo);

  pagesApp.get('/build.js', function(req, res) {
    res.contentType('application/javascript');
    opts.bfy
      .bundle(opts.bundleOpts)
      .on('error', function(err) {
        if (opts.events) opts.events.emit('error', err); else console.error(err);
        sendError(res, err);
      })
      .pipe(res);
  });
  return { app: pagesApp, domainMw: domainMw };
}

function postInitPages (pagesApp, pagesServer, apiServerInfo, customPostInit) {
  customPostInit(pagesApp, pagesServer, express, apiServerInfo);
}

/**
 * Creates browserify bundle, adds a route for the client to obtain it and starts up pages server
 * 
 * @name exports
 * @function
 * @private
 * @param {Object}        opts
 * @param {Object}        opts.bfy            browserify instance
 * @param {Object=}       opts.bundleOpts     options to be passed to browserify.bundle()
 * @param {Function}      opts.customInit     a custom app server initialization function that is called before the server starts listening
 * @param {Function}      opts.customPostInit a custom app server initialization function that is called after the server starts listening
 * @param {Function=}     opts.send500        function that is invoked with `(req, res)` when a server error occurs
 * @param {number=}       opts.port           the port at which the server should listen
 * @param {Object}        opts.apiServerInfo  address info (host, port) about the api server to be passed to custom init function
 * @param {string=}       opts.watchdir       turns on live reload for the given directory 
 * @param {EventEmitter}  opts.events         on which errors will be triggered if they are passed, otherwise errors are logged
 * @param cb {Function} called when server started listening
 * @return {HttpServer}   pages Server
 */
var go = module.exports = function startPages (opts, cb) {
  
  var inited = initPages(opts);
  var pagesApp = inited.app;
  var domainMw = inited.domainMw;

  var pagesServer = pagesApp.listen(opts.port);
  domainMw.server = pagesServer;

  domainMw.events.on('server-error', opts.events.emit.bind(opts.events, 'server-error'));
  domainMw.events.on('fatal-error', opts.events.emit.bind(opts.events, 'fatal-error'));

  if (opts.watchdir) {
    var msg = format('Live reloading turned on for [%s]', opts.watchdir);
    if (opts.events) opts.events.emit('info', msg); else console.log(msg);
    liveReload(pagesServer, opts.watchdir);
  }

  postInitPages(pagesApp, pagesServer, opts.apiServerInfo, opts.customPostInit);

  pagesServer.once('listening', function() {
    var address = pagesServer.address();
    if (cb) cb(null, address); 
  });
  return pagesServer;
};

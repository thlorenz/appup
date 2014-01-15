'use strict';
var createDomain = require('domain').create
  , EE = require('events').EventEmitter
  , cuid = require('cuid')

function defaultSend500(req, res, err /*not used*/) {
  res.setHeader('content-type', 'text/plain');
  res.end('Ooops we are oh so very sorry\n');
}

var go = module.exports = function (send500) {
  var events = new EE();
  var config = { server: null, middleware: middleware, events: events };
  send500 = send500 || defaultSend500;
  return config;

  function handleError(req, res, err) {
    try {
      res.statusCode = 500;
      send500(req, res, err);
      events.trigger('server-error', { error: err, server: config.server }) ;
    } catch (err) {
      events.trigger('fatal-error', {error: err, server: config.server });
    }
  }
   
  function middleware(req, res, next) {
    var d = createDomain();
    d.id = req.id || cuid();

    d.add(req)
    d.add(res)
    d.on('error', handleError.bind(d, req, res))
    d.run(next)
  }
};

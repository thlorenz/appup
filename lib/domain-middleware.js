'use strict';
var createDomain = require('domain').create
  , EE = require('events').EventEmitter
  , cuid = require('cuid')

var go = module.exports = function (server) {

  var events = new EE();
  var config = { server: null, middleware: middleware, events: events };
  return config;

  function send500(res) {
    try {
      res.statusCode = 500;
      res.setHeader('content-type', 'text/plain');
      res.end('Ooops we are oh so very sorry\n');
    } catch (err) {
      events.trigger('fatal-error', {error: err, server: config.server });
    }
  }

  function handleError(res, err) {
    send500(res, events); 
    events.trigger('server-error', { error: err, server: config.server }) ;
  }
   
  function middleware(req, res, next) {
    var d = createDomain();
    d.id = req.id || cuid();

    d.add(req)
    d.add(res)
    d.on('error', handleError.bind(d, res))
    d.run(next)
  }
};

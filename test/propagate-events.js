'use strict';
/*jshint asi: true */

var test = require('tap').test
var EE = require('events').EventEmitter;
var propagate = require('../lib/propagate-events');
test('\nemitting info, warn and error get propagated while ofni is not', function (t) {
  var from = new EE()
    , to = new EE();

  var info, warn, error, serverError, fatalError, ofni;

  to.on('info', function (s) { info = s })
  to.on('warn', function (s) { warn = s })
  to.on('error', function (s) { error = s })
  to.on('server-error', function (s) { serverError = s })
  to.on('fatal-error', function (s) { fatalError = s })
  to.on('ofni', function (s) { ofni = s })

  propagate(from, to);

  from.emit('info', 'info');
  t.equal(info, 'info', 'info propagates');

  from.emit('warn', 'warn');
  t.equal(warn, 'warn', 'warn propagates');

  from.emit('error', 'error');
  t.equal(error, 'error', 'error propagates');

  from.emit('server-error', 'server-error');
  t.equal(serverError, 'server-error', 'server-error propagates');

  from.emit('fatal-error', 'fatal-error');
  t.equal(fatalError, 'fatal-error', 'fatal-error propagates');

  from.emit('ofni', 'ofni');
  t.equal(ofni, undefined, 'ofni does not propagate');

  t.end();
})

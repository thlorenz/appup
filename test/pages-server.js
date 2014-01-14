'use strict';
/*jshint asi: true */

var test       =  require('tap').test
var browserify =  require('browserify');
var express    =  require('express');
var startPages =  require('../lib/pages/start');
var EE         =  require('events').EventEmitter;
var http       =  require('http');
var through    =  require('through2');

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\npages server initialization', function (t) {
  var events = new EE();
  var app = express();

  var initIdx = 0;
  var initedWith;
  var postInitedWith;
  var errors = [];

  function initPages(app, express, info) {
    initedWith = { app: app, express: express, info: info, idx: initIdx++ };  
  }

  function postInitPages(app, server, express, info) {
    postInitedWith = { app: app, server: server, express: express, info: info, idx: initIdx++ };  
  }
  
  var opts = {
      bfy            :  browserify()
    , customInit     :  initPages
    , customPostInit :  postInitPages
    , port           :  5005
    , apiServerInfo  :  { port:  'some port' }
    , events         :  events
  }

  events.on('error', [].push.bind(errors))

  var server = startPages(opts, function (err, address) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(
        address
      , { address: '0.0.0.0',
          family: 'IPv4',
          port: opts.port }
      , 'calls back with addrinfo'
    )

    t.equal(initedWith.idx, 0, 'calls init first')
    t.deepEqual(initedWith.app.settings, app.settings, 'custom inits with app')
    t.deepEqual(typeof initedWith.express.application.init, 'function', 'custom inits with express')
    t.equal(initedWith.info, opts.apiServerInfo, 'custom inits with address info')
    
    t.equal(postInitedWith.idx, 1, 'calls post init last')
    t.deepEqual(postInitedWith.app.settings, app.settings, 'custom post inits with app')
    t.deepEqual(postInitedWith.server, server, 'custom post inits with server')
    t.deepEqual(typeof postInitedWith.express.application.init, 'function', 'custom post inits with express')
    t.equal(postInitedWith.info, opts.apiServerInfo, 'custom post inits with address info')

    t.equal(initedWith.app.routes.get.length, 1, 'adds one GET')
    t.equal(initedWith.app.routes.get[0].path, '/build.js', 'the build route to serve bundle')

    t.equal(errors.length, 0, 'reports no errors')

    server.close(function (err) {
      t.end();
    });
  });
})

test('\npages server bundling no error', function (t) {
  var events = new EE();
  var app = express();

  var errors = [];

  function noop() {}

  var opts = {
      bfy            :  browserify()
    , customInit     :  noop
    , customPostInit :  noop
    , port           :  5006
    , apiServerInfo  :  { port:  'some port' }
    , events         :  events
  }

  events.on('error', [].push.bind(errors))

  var server = startPages(opts, function (err, address) {
    if (err) { t.fail(err); return t.end(); }

    http
      .request({ port: address.port, path: '/build.js' })
      .once('response', function (res) {
        var data = '';

        t.equal(res.statusCode, 200, '200 response');
        t.similar(res.headers['content-type'], /^application\/javascript/, 'application/javascript');

        res.pipe(through(ondata, onend));
        function ondata(d, _, cb) { data += d; cb() }
        function onend() {
          t.equal(errors.length, 0, 'reports no errors')
          t.similar(data, /require=="function"/, 'pipes bundle into response')
          server.close(function (err) {
            t.end();
          });
        }
      })
      .end();

  });
})

test('\npages server bundling with errors', function (t) {
  var events = new EE();
  var app = express();

  var errors = [];

  function noop() {}

  var opts = {
      bfy            :  browserify().require(require.resolve('./pages-server/module-with-errors.js'))
    , customInit     :  noop
    , customPostInit :  noop
    , port           :  5007
    , apiServerInfo  :  { port:  'some port' }
    , events         :  events
  }

  events.on('error', [].push.bind(errors))

  var server = startPages(opts, function (err, address) {
    if (err) { t.fail(err); return t.end(); }

    http
      .request({ port: address.port, path: '/build.js' })
      .once('response', function (res) {
        var data = '';

        t.equal(res.statusCode, 200, '200 response');
        t.similar(res.headers['content-type'], /^application\/javascript/, 'application/javascript');

        res.pipe(through(ondata, onend));
        function ondata(d, _, cb) { data += d; cb() }
        function onend() {
          t.equal(errors.length, 1, 'reports error')
          t.similar(data, /function errored/, 'pipes js that renders error into response')
          server.close(function (err) {
            t.end();
          });
        }
      })
      .end();

  });
})

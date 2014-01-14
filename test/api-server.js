'use strict';
/*jshint asi: true */

var test       =  require('tap').test
var startApi   =  require('../lib/api/start');
var http       =  require('http');
var through    =  require('through2');
var EE         =  require('events').EventEmitter;

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\napi server initialization', function (t) {

  var events = new EE();
  var initIdx = 0;
  var initedWith;
  var postInitedWith;

  function initPages(app, restify) {
    initedWith = { app: app, restify: restify, idx: initIdx++ };  
  }

  function postInitPages(app, server, restify) {
    postInitedWith = { app: app, server: server, restify: restify, idx: initIdx++ };  
  }
  
  var opts = {
      customInit     :  initPages
    , customPostInit :  postInitPages
    , port           :  5002
    , events         :  events
  }

  var server = startApi(opts, function (err, address) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(
        address
      , { address: '0.0.0.0',
          family: 'IPv4',
          port: opts.port }
      , 'calls back with addrinfo'
    )

    t.equal(initedWith.idx, 0, 'calls init first')
    t.equal(initedWith.app.name, 'restify', 'custom inits with restify app')
    t.equal(typeof initedWith.restify.createClient, 'function', 'custom inits with restify');
    
    t.equal(postInitedWith.idx, 1, 'calls post init last')
    t.equal(postInitedWith.app.name, 'restify', 'custom post inits with restify app')
    t.equal(typeof postInitedWith.restify.createClient, 'function', 'custom post inits with restify');
    t.deepEqual(postInitedWith.server, server, 'custom post inits with server')

    server.close(function (err) {
      t.end();
    });
  });
})

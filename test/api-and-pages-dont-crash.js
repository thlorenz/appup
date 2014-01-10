'use strict';
/*jshint asi: true */

var EE         =  require('events').EventEmitter;
var http       =  require('http');
var through    =  require('through2');

var test = require('tap').test
var appup = require('../');

function shutdown(cluster) {
  // prevent more workers being forked, so we can shut down
  cluster.removeAllListeners('disconnect');
  cluster.disconnect();
}

function kill(proc) {
  console.error('killing %d', proc.pid);
  process.kill(proc.pid, 'SIGTERM');
}

test('\npages and api do not crash when request causes async error', function (t) {
  t.plan(4);
  
  var opts = {
      pagesPort : 3002
    , apiPort   : 4002
    , config    : require.resolve('./api-and-pages-dont-crash/appup-config')
    , entry     : require.resolve('./api-and-pages-dont-crash/entry.js')
  }

  var res = appup(opts);
  var cluster = res.pagesCluster
    , proc = res.apiProcess;

  t.on('end', teardown);
  function teardown() {
    shutdown(cluster);
    kill(proc);
  }

  cluster.once('listening', function () {
    // pages
    http
      .request({ port: opts.pagesPort, path: '/no' })
      .once('response', function (res) {
        var data = '';

        t.equal(res.statusCode, 500, '500 response');

        res.pipe(through(ondata, onend));
        function ondata(d, _, cb) { data += d; cb() }
        function onend() {
          t.similar(data, /Ooops we are oh so very sorry/, 'sends error message to client');
        }
      })
      .end();

    // api
    http
      .request({ port: opts.apiPort, path: '/no' })
      .once('response', function (res) {
        var data = '';

        t.equal(res.statusCode, 500, '500 response');

        res.pipe(through(ondata, onend));
        function ondata(d, _, cb) { data += d; cb() }
        function onend() {
          t.similar(data, /Ooops we are oh so very sorry/, 'sends error message to client');
        }
      })
      .end();
  });
})

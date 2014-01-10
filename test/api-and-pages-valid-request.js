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
  proc.kill();
}

test('\npages and api handle valid requests', function (t) {
  t.plan(4);
  
  var opts = {
      pagesPort : 3001
    , apiPort   : 4001
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
      .request({ port: opts.pagesPort, path: '/' })
      .once('response', function (res) {
        var data = '';

        t.equal(res.statusCode, 200, '200 response');
        t.similar(res.headers['content-type'], /^text\/html/, 'text/html');

        res.pipe(through(ondata, onend));
        function ondata(d, _, cb) { data += d; cb() }
        function onend() { }
      })
      .end();

    // api
    http
      .request({ port: opts.apiPort, path: '/' })
      .once('response', function (res) {
        var data = '';

        t.equal(res.statusCode, 200, '200 response');
        t.similar(res.headers['content-type'], /^application\/json/, 'application/json');

        res.pipe(through(ondata, onend));
        function ondata(d, _, cb) { data += d; cb() }
        function onend() {}
      })
      .end();
  });
})

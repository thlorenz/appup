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

test('\npages handle valid requests', function (t) {
  
  var opts = {
      pagesPort: 5003
    , config: require.resolve('./pages-dont-crash/appup-config')
    , entry: require.resolve('./pages-dont-crash/entry.js')
  }

  var cluster = appup(opts).pagesCluster;
  cluster.once('listening', function () {
    http
      .request({ port: opts.pagesPort, path: '/' })
      .once('response', function (res) {
        var data = '';

        t.equal(res.statusCode, 200, '200 response');
        t.similar(res.headers['content-type'], /^text\/html/, 'text/html');

        res.pipe(through(ondata, onend));
        function ondata(d, _, cb) { data += d; cb() }
        function onend() {
          shutdown(cluster);
          t.end();
        }
      })
      .end();

  });
})

test('\npages do not crash when request causes async error', function (t) {
  
  var opts = {
      pagesPort: 5004
    , config: require.resolve('./pages-dont-crash/appup-config')
    , entry: require.resolve('./pages-dont-crash/entry.js')
  }

  var cluster = appup(opts).pagesCluster;
  cluster.once('listening', function () {

    http
      .request({ port: opts.pagesPort, path: '/no' })
      .once('response', function (res) {
        var data = '';

        t.equal(res.statusCode, 500, '500 response');

        res.pipe(through(ondata, onend));
        function ondata(d, _, cb) { data += d; cb() }
        function onend() {
          t.similar(data, /Ooops we are oh so very sorry/, 'sends error message to client');
          shutdown(cluster);
          t.end();
        }
      })
      .end();

  });
})

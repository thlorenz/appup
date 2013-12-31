'use strict';
/*jshint browser: true*/

var cheerio            =  require('cheerio')
  , watchr             =  require('watchr')
  , express            =  require('express')
  , serverEventsStream =  require('sse-stream')('/-/live-reload');

function liveReloadCode() {
  var timeout = 2000;
  /*global EventSource */
  if(window.EventSource) {
    var es = (new EventSource('/-/live-reload'));
    es.onmessage = function(ev) {
      if(ev.data === 'reload') {
        window.location.reload();
      }
    };
  } else {
    setTimeout(iter, timeout);
  }

  function iter() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/-/live-reload');
    xhr.onreadystatechange = function() {
      if(xhr.readyState !== 4) return;

      if(/true/.test(xhr.responseText)) {
        window.location = window.location;
        return;
      }
      xhr = xhr.onreadystatechange = null;
      setTimeout(iter, timeout);
    };

    xhr.send(null);
  }
}

function injectLiveReload (body) {
  var script = '<script type=\"text/javascript\">\n;(' + liveReloadCode + ')()\n<\/script>\n';
  var dom = cheerio(body);
  var scripts = dom.find('script');
  scripts.before(script);

  return dom.toString();
}

function isHtml(headers, body) {
  return headers 
      && headers['content-type'] === 'text/html'
      && typeof body === 'string' 
      && ~body.indexOf('<!DOCTYPE html>');
}

function initEventStream(server, watchdir) {
  var shouldReload = false
    , connections = [];

  watchr.watch({
      path              :  watchdir
    , listener          :  doReload
    , ignoreHiddenFiles :  true
    , ignorePatterns    :  true
  });

  function doReload() {
    shouldReload = true;
    connections.forEach(function(conn) { conn.write('reload') });
  }

  serverEventsStream.install(server);
  serverEventsStream.on('connection', function (conn) {
    connections.push(conn);
    conn.once('end', function () { 
      // XXXX: removing seems to not work properly, but not really an issue
      // sine this is only used in development and usually only one tab will be open
      connections.splice(connections.indexOf(conn), 1) });  
  });
}

module.exports = function liveReload(server, watchdir, events) {
  // very dirty, but the only way we can inject hour script
  // XXX: only works for send right now, may need to override .pipe and others as well
  var response = express.response;
  var response_send = response.send;

  response.send = function (status, body) {
    var headers = this.getHeaders();

    if (status !== 200 || !isHtml(headers, body)) {
      return response_send.apply(this, arguments);
    }

    var injected = injectLiveReload(body);

    response_send.call(this, status, injected);  
  };

  initEventStream(server, watchdir);
}


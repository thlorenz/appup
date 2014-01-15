'use strict';
/*jshint browser: true*/

var cheerio            =  require('cheerio')
  , watchr             =  require('watchr')
  , express            =  require('express')
  , serverEventsStream =  require('sse-stream')('/-/live-reload');

function liveReloadCode() {
  var timeout = 1000;
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

module.exports = 

/**
 * Injects the client side script that will connect to the server's event stream
 * and initializes the file watcher in order to push an event to the client
 * whenever a file in the given watchdir changed.
 * Pushing that event will cause the client to reload the current page.
 * 
 * @name liveReload
 * @private
 * @function
 * @param {Object} server the http server
 * @param {string} watchdir full path to the directory to watch for client side code changes
 */
function liveReload(server, watchdir) {
  // very dirty, but the only way we can inject hour script
  // XXX: only works for send right now, may need to override .pipe and others as well
  var response = express.response;
  var response_send = response.send;

  response.send = function (status, body) {
    if (typeof this.getHeaders !== 'function') {
      return response_send.apply(this, arguments);
    }

    var headers = this.getHeaders();
    if (status !== 200 || !isHtml(headers, body)) {
      return response_send.apply(this, arguments);
    }

    var injected = injectLiveReload(body);

    response_send.call(this, status, injected);  
  };

  initEventStream(server, watchdir);
}


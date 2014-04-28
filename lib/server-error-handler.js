'use strict';

var go = module.exports = function (cluster, events, killTimeout) {

  function disconnect() {
    // tell master we are shutting down so he can fork another server worker
    cluster.worker.disconnect();
  }

  function shutdown(server) {
    try { 
      // only close server if it's running
      if (server._handle) return server.close(disconnect);
    } catch (e) {
      events.emit('fatal-error', e);
    }

    // always attempt to disconnect the worker
    disconnect();
  }

  return function onServerError(fatal, errinfo) {
    var err = errinfo.error
      , server = errinfo.server;

    if (fatal) {
      events.emit('error', 'A fatal server error occurred and the request went unhandled, restarting.');
      events.emit('fatal-error', errinfo);
    } else { 
      events.emit('error', 'A server error occurred while handling a request, restarting.\n' + err.stack);
    }

    try {
      // if process doesn't shutdown gracefully within given timeout, we'll have to force it to
      var killtimer = setTimeout(process.exit.bind(process, 1), killTimeout);

      // timer shouldn't prevent process from closing by itself
      killtimer.unref();

      shutdown(server);

    } catch (e) {
      // pretty much screwed if we get here
      events.emit('error', 'Error trying to shut down worker\n' + e.stack);
      events.emit('fatal-error', e);
    }
  }
}

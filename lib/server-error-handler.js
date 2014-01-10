
'use strict';

var go = module.exports = function (cluster, events, killTimeout) {

  return function onServerError(fatal, errinfo) {
    var err = errinfo.err
      , server = errinfo.server;

    if (fatal) {
      events.emit('error', 'A fatal server error occurred and the request went unhandled, restarting.');
      events.emit('fatal-error', errinfo);
    } else { 
      events.emit('error', 'A server error occurred while handling a request, restarting.');
    }

    try {
      // if process doesn't shutdown gracefully within given timeout, we'll have to force it to
      var killtimer = setTimeout(process.exit.bind(process, 1), killTimeout);

      // timer shouldn't prevent process from closing by itself
      killtimer.unref();

      server.close();

      // tell master we are shutting down so he can fork another server worker
      cluster.worker.disconnect();
    } catch (e) {
      // pretty much screwed if we get here
      events.emit('error', 'Error trying to shut down worker\n' + e.stack);
      events.emit('fatal-error', errinfo);
    }
  }
}

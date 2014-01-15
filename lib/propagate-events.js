'use strict';

var eventNames = [ 'info', 'warn', 'error', 'server-error', 'fatal-error' ];

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

var go = module.exports = 

/**
 * Propagates selected events @see eventNames to a given target if given or logs them to the console otherwise.
 * 
 * @name propagateEvents
 * @private
 * @function
 * @param {EventEmitter} from source of events
 * @param {EventEmitter=} to   target of progagated events
 */
function (from, to) {
  if (to) {
      eventNames.forEach(function (name) { 
        var handler = to.emit.bind(to, name);
        from.on(name, handler);
      });
  } else {
    eventNames.forEach(function (name) { 
      from.on(name, function (msg) { console.error('[%s] %s', name, msg) });
    })
  }
}

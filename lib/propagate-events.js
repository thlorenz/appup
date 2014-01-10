'use strict';
var eventNames = [ 'info', 'warn', 'error' ];

var go = module.exports = function (from, to) {
  if (to) {
      eventNames.forEach(function (name) { 
        from.on(name, to.on.bind(to, name));
      });
  } else {
    eventNames.forEach(function (name) { 
      from.on(name, function (msg) { console.error('[%s] %s', name, msg) });
    })
  }
}

'use strict';

module.exports = 

/**
 * Used when only a single instance of api and pages is run during development.
 * 
 * @name singleServerErrorHandler
 * @function
 * @private
 * @param {EventEmitter} events used to emit information about the error 
 * @param {Boolean} fatal       if `true` error is considered fatal
 * @param {Object} errinfo      info about the error that occurred
 */
function singleServerErrorHandler(events, fatal, errinfo) {
  var err = errinfo && errinfo.error
    , server = errinfo && errinfo.server;

  if (fatal) {
    events.emit('error'
      , 'A fatal server error occurred and the request went unhandled, ' +
        'if clusters were used, the server would be restarting.'
    );
    events.emit('fatal-error', errinfo);
  } else { 
    events.emit('error'
      , 'A server error occurred while handling a request. ' +
        'If clusters were used, the server would be restarting.\n' + (err && err.stack)
    );
  }
}


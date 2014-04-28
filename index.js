'use strict';

var path        = require('path');
var optimist    = require('optimist');
var fork        = require('child_process').fork;
var xtend       = require('xtend');
var localtunnel = require('localtunnel')

var pagesMaster   = require('./lib/pages/master')
  , apiMaster     = require('./lib/api/master')
  , apiForkScript = require.resolve('./lib/api/fork')

var singlePages = require('./lib/pages/single')
  , singleApi   = require('./lib/api/single')

function setupLocalTunnel(opts) {
  var config = opts.config ? require(opts.config) : {}
    , events = config.events;

  localtunnel(opts.pagesPort, function (err, tunnel) {
    if (err) {
      if (events) events.emit('error', err); else console.error(err);
    } else {
      var msg = 'tunnel url: ' + tunnel.url;
      if (events) events.emit('info', msg); else console.error(msg);
    }
  })
}

function launchClustered(apiPort, pagesPort, opts) {
  var apiProcess, pagesCluster, apiCluster;

  if (apiPort && pagesPort) {
    apiProcess = fork(
        apiForkScript
      , process.argv 
      , { env: xtend(process.env, { appup_api_fork_opts: JSON.stringify(opts) }) }
    );

    // ensure proper shutdown of forked child - was an issue without this when using supervisor
    var onSIGTERM = function() { 
      apiProcess.kill('SIGTERM');
      process.removeListener('SIGTERM', onSIGTERM);
      process.exit(0);
    }
    process.on('SIGTERM', onSIGTERM);

    pagesCluster = pagesMaster(opts);
  } else if (apiPort) { 
    apiCluster = apiMaster(opts);
  } else if (pagesPort) {
    pagesCluster = pagesMaster(opts);
  }

  if (opts.tunnel) setupLocalTunnel(opts);

  return { pagesCluster: pagesCluster, apiCluster: apiCluster, apiProcess: apiProcess };
}

function launchSingle(apiPort, pagesPort, opts) {
  if (apiPort)   singleApi(opts);
  if (pagesPort) singlePages(opts)
}

/**
 * Creates browserify bundle and starts up pages server and/or api server according to the supplied options.
 *
 * If no api port is given, the api server is not started up.
 * If no pages port is given, the pages server is not started up.
 * If neither port is given, an error is thrown.
 * 
 * @name appup
 * @function
 * @param {Object}   opts 
 * @param {number=}  opts.pagesPort port at which to start up pages server
 * @param {number=}  opts.apiPort   port at which to start up api server
 * @param {string=}  opts.apiHost   specifies where api server is hosted (default: 'localhost')
 * @param {string}   opts.config    full path configuration provided to override browserify specific options and/or custom API/Pages servers init functions
 * @param {string}   opts.entry     entry file to add to browserify
 * @param {string=}  opts.watchdir  turns on live reload for the given directory 
 * @param {boolean=} opts.dedupe    turns on dynamic-dedupe
 * @param {boolean=} opts.tunnel    sets up local tunnel pointing to @see opts.pagesPort and logs url to connect to from remote client
 * @param {boolean=} opts.nocluster (default: `false`) if set to `true` single servers are launched instead of a cluster of them
 */
var go = module.exports = function appup(opts) {
  var pagesPort =  opts.pagesPort;
  var apiPort   =  opts.apiPort;

  if (!pagesPort && !apiPort) { 
    throw new Error('Need to pass either pages or api port in order for me to start an app');
  }

  return opts.nocluster 
    ? launchSingle(apiPort, pagesPort, opts)
    : launchClustered(apiPort, pagesPort, opts)
};

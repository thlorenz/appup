'use strict';

var path     = require('path');
var optimist = require('optimist');
var fork     = require('child_process').fork;

var pagesMaster   = require('./lib/pages/master')
  , apiMaster     = require('./lib/api/master')
  , apiForkScript = require.resolve('./lib/api/fork');

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
 * @param {string=}  opts.apiHost   specifies where api server is hosted default(http://localhost)
 * @param {string}   opts.config    full path configuration provided to override browserify specific options and/or custom API/Pages servers init functions
 * @param {string}   opts.entry     entry file to add to browserify
 * @param {string=}  opts.watchdir  turns on live reload for the given directory 
 * @param {boolean=} opts.dedupe    turns on dynamic-dedupe
 */
var go = module.exports = function appup(opts) {

  var pagesPort =  opts.pagesPort;
  var apiPort   =  opts.apiPort;
  var apiHost   =  opts.apiHost || 'http://locahost';

  var apiProcess, pagesCluster, apiCluster;

  if (!pagesPort && !apiPort) throw new Error('Need to pass either pages or api port in order for me to start an app');

  // TODO: propagate api info to pages-start
  if (apiPort && pagesPort) {
    apiProcess = fork(apiForkScript, [], { env: { appup_api_fork_opts: JSON.stringify(opts) } });
    pagesCluster = pagesMaster(opts);
  } else if (apiPort) { 
    apiCluster = apiMaster(opts);
  } else if (pagesPort) {
    pagesCluster = pagesMaster(opts);
  }

  return { pagesCluster: pagesCluster, apiCluster: apiCluster, apiProcess: apiProcess };
};

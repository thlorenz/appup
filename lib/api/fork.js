#!/usr/bin/env node

'use strict';

var apiMaster = require('./master');

/* Forks the api master which launches the api server
 * Forking is necessary if we want to launch pages and api server in one go since there can only  be one cluster master 
 * per process.
 * In general it's a good idea to isolate both servers into separate processes so one can not bring down the other
 */
(function startMaster() {

var opts;
try { 
  if (!process.env.appup_api_fork_opts) throw new Error('appup_api_fork_opts missing');
  opts = JSON.parse(process.env.appup_api_fork_opts);
} catch (e) {
  console.error(e);
  return;
}

apiMaster(opts);
})();

'use strict';

var workerPath = require.resolve('./worker');
var initCluster = require('../init-cluster');

var go = module.exports = function master(opts) {
  var workerEnv = { appup_pages_worker_opts: JSON.stringify(opts) }
    , forks = opts.forks || 2;

  return initCluster(workerPath, workerEnv, forks);
}

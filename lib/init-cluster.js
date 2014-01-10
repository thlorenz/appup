'use strict';

var cluster = require('cluster');

var go = module.exports = 

/**
 * Inits the master end of the cluster.
 *
 * Note that the cluster module returns a singleton Event Emitter.
 * This means that any future require('cluster') calls will return this cluster.
 * This also makes it necessary to spawn a separate process for each master.
 *
 * @name initCluster
 * @private
 * @function
 * @param {string} workerPath full path to the script that sets up the worker end of the cluster
 * @param {string} workerEnv stringified options to be passed to the worker
 * @param {number=} forks number of workers to run concurrently
 * @return {Object} cluster
 */
function (workerPath, workerEnv, forks) {
  cluster.setupMaster({ exec: workerPath });
  cluster
    .on('disconnect', function (worker) {
      // this gets called no matter how the server went down
      // gracefully via server.close or with a plain crash of the process
      // either way our master is insulated from these happenings and can keep spinning up new ones 
      cluster.fork(workerEnv);
    })
    .on('online', function (worker) {
      var workerCount = Object.keys(cluster.workers).length;
      console.error('worker [pid:%d, id:%d] came online - total workers online: %d', worker.process.pid, worker.id, workerCount);
    })
    .on('listening', function (worker, address) {
      console.error('worker %d started listening on http://%s:%s', worker.id, address.address, address.port);
    })

  while (forks--) cluster.fork(workerEnv);

  return cluster;
};

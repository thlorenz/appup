#!/usr/bin/env node

'use strict';

var optimist = require('optimist');
var appup = require('../');
var path = require('path');

var cwd = process.cwd();

var argv = optimist
  .usage('appup [options] file')

  .describe('pages'    , 'port to start pages server on')
  .describe('watchdir' , 'directory to watch for client side JavaScript changes in order to automatically refresh')
  .describe('dedupe'   , 'if set it will [dynamically dedupe] (https://github.com/thlorenz/dynamic-dedupe)\n\t all modules as they are being required to work around the fact that symlinks break `npm dedupe`')

  .describe('api'      , 'port to start api server on')
  .describe('apihost'  , 'address at which api server is hosted')

  .describe('tunnel'   , 'sets up local tunnel pointing to pages port and logs url to connect to from remote client')

  .describe('config'   , 'point to a config file to override routes, etc. for the pages and api server')
  
  .describe('nocluster', 'if set, single servers are launched instead of a cluster of them, which maybe preferred during development')

  .default ('apihost'  , 'localhost')
  .boolean ('dedupe')

  .argv;

function usageAndBail () {
  optimist.showHelp();
  process.exit();
}

if (argv.help) usageAndBail();

var entry = argv._[0];

if (!entry) {
  console.error('Please provide path to entry file as last argument');
  usageAndBail();
}

var config = path.join(cwd, argv.config); 
var pagesPort = argv.pages;
var apiPort = argv.api;
var dedupe = !!argv.dedupe;
var watchdir = argv.watchdir && path.resolve(argv.watchdir);

appup({
    config    :  config
  , entry     :  entry
  , pagesPort :  pagesPort
  , apiPort   :  apiPort
  , apiHost   :  argv.apihost
  , tunnel    :  argv.tunnel
  , nocluster :  argv.nocluster
  , watchdir  :  watchdir
  , dedupe    :  dedupe
});

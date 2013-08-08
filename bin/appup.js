#!/usr/bin/env node

'use strict';
var optimist = require('optimist');
var appup = require('../');
var path = require('path');

var cwd = process.cwd();

var argv = optimist
  .usage('appup [options] file')
  .describe('pages', 'port to start pages server on')
  .describe('api', 'port to start api server on')
  .describe('config', 'point to a config file to override routes, etc. for the pages and api server')
  .argv;

function usageAndBail () {
  optimist.showHelp();
  process.exit();
}

if (argv.help) usageAndBail();

var entry = argv._[0];

if (!entry) {
  // TODO: we could also find the 'browser' field in the cwd/package.json
  console.error('Please provide path to entry file as last argument');
  usageAndBail();
}

var config = argv.config ? require(path.join(cwd, argv.config)) : {};
var pagesPort = argv.pages;
var apiPort = argv.api;

appup({
    config: config
  // could be 'cwd' to make browserify pick up package.json info
  , entry: entry
  , pagesPort: pagesPort
  , apiPort: apiPort
});

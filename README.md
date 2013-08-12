# appup

CLI to launch apps that use an express main server and an optional restif api server.

## Installation

    npm install appup

## CLI

```
appup [options] file

Options:
  --pages   port to start pages server on
  --api     port to start api server on
  --config  point to a config file to override routes, etc. for the pages and api server
```

## API

###*appup(opts)*

```
/**
 * Creates browserify bundle and starts up pages server and/or api server according to the supplied options.
 *
 * If no api port is given, the api server is not started up.
 * If no pages port is given, the pages server is not started up.
 * If neither port is given, an error is thrown.
 * 
 * @name exports
 * @function
 * @param opts {Object} with the following properties
 *  - pages: port at which to start up pages server (optional)
 *  - api: port at which to start up api server (optional)
 *  - config: configuration provided to override browserify specific options and/or custom API/Pages servers init functions
 *  - entry: entry file to add to browserify
 */
```

### config

The config needs to provide either or all of the following properties on the module exports object:

- **bundleOpts**: `{Object}` options passed to `browserify().bundle(options)`
- **initBrowserify**: `{Function}` invoked with `browserify` that needs to return a browserify *instance* that can be
  initialized according to our needs
- **initPages** {Function} invoked with `(pagesApp, express, apiServerInfo)` where apiServerInfo is `{ address: {Object} }`
- **postInitPages** {Function} invoked with `(pagesApp, pagesServer, express)` where `pagesServer` is the result of
  `pagesApp.listen()`
- **initApi** {Function} invoked with `(apiApp, restify)`
- **postInitApi** {Function} invoked with `(apiApp, apiServer, restify)` where `apiServer` is the result of
  `apiApp.listen()`

#### Example config

```js
// Bundle options
exports.bundleOpts = { debug: true, insertGlobals: false };

exports.initBrowserify = function (browserify) {
  return browserify().transform('hbsfy');
};

// Server options

// Pages
exports.initPages = function (pagesApp, express, apiServerInfo) {
  pagesApp.use(core.renderViewMiddleware(viewPath, { title: 'core' }));
};

exports.postInitPages = function (pagesApp, pagesServer, express) {
};

// API 
exports.initApi = function (apiApp, restify) {
};

exports.postInitApi = function (apiApp, apiServer, restify) {
};
```

## License

MIT

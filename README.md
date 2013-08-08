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

## License

MIT

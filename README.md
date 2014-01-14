# appup [![build status](https://secure.travis-ci.org/thlorenz/appup.png?branch=master)](http://travis-ci.org/thlorenz/appup)

CLI to launch apps that use an express main server and an optional restif api server.

## Installation

    npm install appup

## CLI

```
appup [options] file

Options:
  --pages     port to start pages server on
  --watchdir  directory to watch for client side JavaScript changes in order to automatically refresh
  --dedupe    if set it will [dynamically dedupe] (https://github.com/thlorenz/dynamic-dedupe)
	            all modules as they are being required to work around the fact that symlinks break `npm dedupe`
  --api       port to start api server on
  --apihost   address at which api server is hosted [default: "localhost"]
  --config    point to a config file to override routes, etc. for the pages and api server
```

## API

<!-- START docme generated API please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN docme TO UPDATE -->

<div>
<div class="jsdoc-githubify">
<section>
<article>
<div class="container-overview">
<dl class="details">
</dl>
</div>
<dl>
<dt>
<h4 class="name" id="appup"><span class="type-signature"></span>appup<span class="signature">(opts)</span><span class="type-signature"></span></h4>
</dt>
<dd>
<div class="description">
<p>Creates browserify bundle and starts up pages server and/or api server according to the supplied options.</p>
<p>If no api port is given, the api server is not started up.
If no pages port is given, the pages server is not started up.
If neither port is given, an error is thrown.</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>opts</code></td>
<td class="type">
<span class="param-type">Object</span>
</td>
<td class="description last">
<h6>Properties</h6>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Argument</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>pagesPort</code></td>
<td class="type">
<span class="param-type">number</span>
</td>
<td class="attributes">
&lt;optional><br>
</td>
<td class="description last"><p>port at which to start up pages server</p></td>
</tr>
<tr>
<td class="name"><code>apiPort</code></td>
<td class="type">
<span class="param-type">number</span>
</td>
<td class="attributes">
&lt;optional><br>
</td>
<td class="description last"><p>port at which to start up api server</p></td>
</tr>
<tr>
<td class="name"><code>apiHost</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="attributes">
&lt;optional><br>
</td>
<td class="description last"><p>specifies where api server is hosted (default: 'localhost')</p></td>
</tr>
<tr>
<td class="name"><code>config</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="attributes">
</td>
<td class="description last"><p>full path configuration provided to override browserify specific options and/or custom API/Pages servers init functions</p></td>
</tr>
<tr>
<td class="name"><code>entry</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="attributes">
</td>
<td class="description last"><p>entry file to add to browserify</p></td>
</tr>
<tr>
<td class="name"><code>watchdir</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="attributes">
&lt;optional><br>
</td>
<td class="description last"><p>turns on live reload for the given directory</p></td>
</tr>
<tr>
<td class="name"><code>dedupe</code></td>
<td class="type">
<span class="param-type">boolean</span>
</td>
<td class="attributes">
&lt;optional><br>
</td>
<td class="description last"><p>turns on dynamic-dedupe</p></td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/appup/blob/master/index.js">index.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/appup/blob/master/index.js#L11">lineno 11</a>
</li>
</ul></dd>
</dl>
</dd>
</dl>
</article>
</section>
</div>

*generated with [docme](https://github.com/thlorenz/docme)*
</div>
<!-- END docme generated API please keep comment here to allow auto update -->

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
- **events** {EventEmitter} used to emit `info` and `error` events, if not provided messages are logged to the console
  instead

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

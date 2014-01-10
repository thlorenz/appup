'use strict';

function okPagesRoute(req, res) {
  res.send(200, '<h2>All good</2>');
  res.end();
}

function notOkPagesRoute(req, res) {
  // prevent express from handling this error via a try/catch ;)
  setTimeout(function () { throw new Error('Don\'t ever go to ' + req.path); }, 50);
}

function okApiRoute(req, res) {
  res.send(200, { all: 'good' });
  res.end();
}

function notOkApiRoute(req, res) {
  // prevent express from handling this error via a try/catch ;)
  setTimeout(function () { throw new Error('Don\'t ever go to ' + req.getPath()); }, 50);
}

exports.initPages = function (app, express, apiServerInfo) {
  app.get('/', okPagesRoute);
  app.get('/no', notOkPagesRoute);
};

exports.initApi = function (app, restify) {
  app.get('/', okApiRoute);
  app.get('/no', notOkApiRoute);
};

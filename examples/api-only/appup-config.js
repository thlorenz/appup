'use strict';

function okRoute(req, res) {
  res.send(200, { all: 'good' });
  res.end();
}

function notOkRoute(req, res) {
  // prevent express from handling this error via a try/catch ;)
  setTimeout(function () { throw new Error('Don\'t ever go to ' + req.getPath()); }, 50);
}

exports.initApi = function (app, restify) {
  app.get('/', okRoute);
  app.get('/no', notOkRoute);
};

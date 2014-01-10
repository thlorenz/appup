'use strict';

function okRoute(req, res) {
  res.send(200, '<h2>All good</2>');
  res.end();
}

function notOkRoute(req, res) {
  // prevent express from handling this error via a try/catch ;)
  setTimeout(function () { throw new Error('Don\'t ever go to ' + req.path); }, 50);
}

exports.initPages = function (app, express, apiServerInfo) {
  app.get('/', okRoute);
  app.get('/no', notOkRoute);
};

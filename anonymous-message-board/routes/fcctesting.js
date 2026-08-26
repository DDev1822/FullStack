'use strict';

const cors = require('cors');
const fs = require('fs');
const path = require('path');
const runner = require('../test-runner');

module.exports = function (app) {
  app.get('/_api/server.js', function (req, res, next) {
    fs.readFile(path.join(__dirname, '..', 'server.js'), function (err, data) {
      if (err) return next(err);
      res.type('text').send(data.toString());
    });
  });

  app.get('/_api/routes/api.js', function (req, res, next) {
    fs.readFile(path.join(__dirname, 'api.js'), function (err, data) {
      if (err) return next(err);
      res.type('text').send(data.toString());
    });
  });

  app.get('/_api/get-tests', cors(), function (req, res, next) {
    if (process.env.NODE_ENV === 'test') return next();
    res.json({ status: 'unavailable' });
  }, function (req, res, next) {
    if (!runner.report) return next();
    res.json(testFilter(runner.report, req.query.type, req.query.n));
  }, function (req, res) {
    runner.once('done', function () {
      res.json(testFilter(runner.report, req.query.type, req.query.n));
    });
  });

  app.get('/_api/app-info', function (req, res) {
    res.json({ headers: res.getHeaders() });
  });
};

function testFilter(tests, type, n) {
  let out;
  switch (type) {
    case 'functional':
      out = tests.filter(function (test) {
        return test.context && test.context.match('Functional Tests');
      });
      break;
    default:
      out = tests;
  }

  if (n !== undefined) {
    return out[n] || out;
  }
  return out;
}

'use strict';

const cors = require('cors');
const fs = require('fs');
const path = require('path');
const runner = require('../test-runner');

module.exports = function (app) {
  app.get('/_api/server.js', function (req, res, next) {
    fs.readFile(path.join(__dirname, '..', 'server.js'), function (err, data) {
      if (err) return next(err);
      res.type('txt').send(data.toString());
    });
  });

  app.get('/_api/routes/api.js', function (req, res, next) {
    fs.readFile(path.join(__dirname, 'api.js'), function (err, data) {
      if (err) return next(err);
      res.type('txt').send(data.toString());
    });
  });

  app.get(
    '/_api/get-tests',
    cors(),
    function (req, res, next) {
      if (process.env.NODE_ENV === 'test') return next();
      return res.json({ status: 'unavailable' });
    },
    function (req, res, next) {
      if (!runner.report) return next();
      return res.json(testFilter(runner.report, req.query.type, req.query.n));
    },
    function (req, res) {
      runner.once('done', function (report) {
        res.json(testFilter(report, req.query.type, req.query.n));
      });
    }
  );

  app.get('/_api/app-info', function (req, res) {
    const headers = res.getHeaders ? res.getHeaders() : {};
    res.json({ headers });
  });
};

function testFilter(tests, type, n) {
  let out;

  switch (type) {
    case 'unit':
      out = tests.filter(test => test.context.includes('Unit Tests'));
      break;
    case 'functional':
      out = tests.filter(
        test => test.context.includes('Functional Tests') && !test.title.includes('#example')
      );
      break;
    default:
      out = tests;
  }

  if (n !== undefined) {
    return out[Number(n)] || out;
  }

  return out;
}

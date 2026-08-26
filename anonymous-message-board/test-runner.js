'use strict';

const analyser = require('./assertion-analyser');
const EventEmitter = require('events').EventEmitter;
const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

const emitter = new EventEmitter();

emitter.run = function () {
  const mocha = new Mocha({ ui: 'tdd', timeout: 15000 });
  const testDir = path.join(__dirname, 'tests');

  fs.readdirSync(testDir)
    .filter(function (file) { return file.endsWith('.js'); })
    .forEach(function (file) { mocha.addFile(path.join(testDir, file)); });

  const tests = [];
  let context = '';
  const separator = ' -> ';

  mocha.run()
    .on('test end', function (test) {
      let body = test.body || '';
      body = body.replace(/\/\/.*\n|\/\*[\s\S]*?\*\//g, '');
      body = body.replace(/\s+/g, ' ');

      tests.push({
        title: test.title,
        context: context.slice(0, -separator.length),
        state: test.state,
        assertions: analyser(body)
      });
    })
    .on('suite', function (suite) {
      context += suite.title + separator;
    })
    .on('suite end', function (suite) {
      context = context.slice(0, -(suite.title.length + separator.length));
    })
    .on('end', function () {
      emitter.report = tests;
      emitter.emit('done', tests);
    });
};

module.exports = emitter;

'use strict';

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

  mocha.run()
    .on('test end', function (test) {
      tests.push({
        title: test.title,
        context: test.parent ? test.parent.fullTitle() : '',
        state: test.state
      });
    })
    .on('end', function () {
      emitter.report = tests;
      emitter.emit('done', tests);
    });
};

module.exports = emitter;

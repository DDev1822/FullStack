const analyser = require('./assertion-analyser');
const EventEmitter = require('events').EventEmitter;
const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

const mocha = new Mocha({ ui: 'tdd', timeout: 20000 });
const testDir = path.join(__dirname, 'tests');

fs.readdirSync(testDir)
  .filter(file => file.endsWith('.js'))
  .forEach(file => mocha.addFile(path.join(testDir, file)));

const emitter = new EventEmitter();

emitter.run = function () {
  const tests = [];
  let context = '';
  const separator = ' -> ';

  const mochaRunner = mocha
    .run()
    .on('test end', function (test) {
      let body = test.body.replace(/\/\/.*\n|\/\*.*\*\//g, '');
      body = body.replace(/\s+/g, ' ');

      tests.push({
        title: test.title,
        context: context.slice(0, -separator.length),
        state: test.state,
        assertions: analyser(body)
      });
    })
    .on('end', function () {
      emitter.report = tests;
      emitter.emit('done', tests);
    })
    .on('suite', function (suite) {
      context += suite.title + separator;
    })
    .on('suite end', function (suite) {
      context = context.slice(0, -(suite.title.length + separator.length));
    });

  return mochaRunner;
};

module.exports = emitter;

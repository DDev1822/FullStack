'use strict';

const fs = require('fs');
const http = require('http');

const deadline = Date.now() + 60000;
const resultPath = 'ci-result.json';

function writeResult(payload) {
  fs.writeFileSync(resultPath, JSON.stringify(payload, null, 2) + '\n');
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port: process.env.PORT || 3000,
        path,
        timeout: 5000
      },
      res => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (error) {
            reject(new Error('Invalid JSON from ' + path + ': ' + body));
          }
        });
      }
    );

    req.on('timeout', () => req.destroy(new Error('HTTP request timed out')));
    req.on('error', reject);
  });
}

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await getJson('/_api/get-tests?type=functional');

      if (response.status === 200 && Array.isArray(response.body) && response.body.length === 5) {
        const failed = response.body.filter(test => test.state !== 'passed');
        const result = {
          status: failed.length === 0 ? 'pass' : 'fail',
          total: response.body.length,
          passed: response.body.length - failed.length,
          failed: failed.length,
          tests: response.body
        };

        writeResult(result);
        console.log(JSON.stringify(result, null, 2));

        if (failed.length > 0) {
          throw new Error(
            failed.length + ' functional test(s) failed: ' +
              failed.map(test => test.title).join('; ')
          );
        }

        console.log('CONTROL FINAL: PASS — 5/5 functional tests passed.');
        return;
      }
    } catch (error) {
      lastError = error;
      if (fs.existsSync(resultPath)) throw error;
    }

    await sleep(1500);
  }

  const error = lastError || new Error('Timed out waiting for the freeCodeCamp functional-test report.');
  writeResult({ status: 'error', message: error.message });
  throw error;
}

main().catch(error => {
  if (!fs.existsSync(resultPath)) {
    writeResult({ status: 'error', message: error.message });
  }
  console.error(error.stack || error.message);
  process.exit(1);
});

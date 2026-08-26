const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');

const PORT = 3210;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function waitForServer(child) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server startup timeout')), 10000);

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);
      if (text.includes(`listening on port ${PORT}`)) {
        clearTimeout(timeout);
        resolve();
      }
    });

    child.stderr.on('data', (chunk) => process.stderr.write(chunk));
    child.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Server exited before tests with code ${code}`));
    });
  });
}

(async () => {
  const server = spawn(process.execPath, ['index.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForServer(server);

    const home = await fetch(`${BASE_URL}/`);
    assert.equal(home.status, 200, 'GET / must return HTTP 200');
    const html = await home.text();
    assert.match(html, /File Metadata/i, 'Home page should identify the service');

    const payload = Buffer.from('freeCodeCamp file metadata test\n', 'utf8');
    const form = new FormData();
    form.append('upfile', new Blob([payload], { type: 'text/plain' }), 'fcc-test.txt');

    const response = await fetch(`${BASE_URL}/api/fileanalyse`, {
      method: 'POST',
      body: form,
    });

    assert.equal(response.status, 200, 'POST /api/fileanalyse must return HTTP 200');
    const json = await response.json();

    assert.equal(json.name, 'fcc-test.txt');
    assert.equal(json.type, 'text/plain');
    assert.equal(json.size, payload.length);

    const emptyForm = new FormData();
    const noFileResponse = await fetch(`${BASE_URL}/api/fileanalyse`, {
      method: 'POST',
      body: emptyForm,
    });
    assert.equal(noFileResponse.status, 400, 'Missing file should return HTTP 400');

    console.log('HTTP TESTS PASS');
    console.log(JSON.stringify(json));
  } finally {
    server.kill('SIGTERM');
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

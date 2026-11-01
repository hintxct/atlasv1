const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
const http = require('http');
const { createHash } = require('crypto');
const { spawnSync } = require('child_process');
const dotenv = require('../backend/node_modules/dotenv');
const { getLocalPort, downloadArchive } = require('./local-mongo');
const { assertPortFree, ensureConfig } = require('./start');

test('only simple local MongoDB URIs permit automatic server startup', () => {
  assert.equal(getLocalPort('mongodb://localhost/ne-logistics'), 27017);
  assert.equal(getLocalPort('mongodb://127.0.0.1:27018/ne-logistics'), 27018);
  for (const uri of [undefined, 'mongodb+srv://host/db', 'mongodb://host/db', 'mongodb://user:pass@localhost/db', 'mongodb://localhost/db?replicaSet=rs0', 'mongodb://localhost:99999/db']) {
    assert.equal(getLocalPort(uri), null);
  }
});

test('creates stable local config without overwriting existing database settings', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-config-'));
  try {
    ensureConfig(dir, dotenv);
    const file = path.join(dir, '.env');
    const first = fs.readFileSync(file, 'utf8');
    const values = dotenv.parse(first);
    assert.equal(values.MONGODB_URI, 'mongodb://127.0.0.1:27017/ne-logistics');
    assert.match(values.JWT_SECRET, /^[a-f0-9]{96}$/);
    ensureConfig(dir, dotenv);
    assert.equal(fs.readFileSync(file, 'utf8'), first);
    const custom = 'MONGODB_URI=mongodb+srv://custom/db\nJWT_SECRET=keep-me\nSOCKET_CORS_ORIGIN=http://localhost:3000\n';
    fs.writeFileSync(file, custom);
    ensureConfig(dir, dotenv);
    assert.equal(fs.readFileSync(file, 'utf8'), custom);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('occupied ports fail with an actionable error rather than changing ports', async () => {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  try { await assert.rejects(assertPortFree(port), /already|in use/); }
  finally { await new Promise((resolve) => server.close(resolve)); }
  await assertPortFree(port);
});

test('downloads resume, full responses replace partial files, and checksum failures are rejected', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-download-'));
  const archive = path.join(dir, 'test.zip');
  const data = Buffer.from('A verified archive fixture for resumable downloads.');
  const hash = createHash('sha256').update(data).digest('hex');
  let ignoreRange = false;
  let range;
  const server = http.createServer((req, res) => {
    range = req.headers.range;
    const offset = !ignoreRange && range ? Number(range.match(/bytes=(\d+)-/)[1]) : 0;
    if (offset) { res.statusCode = 206; res.setHeader('Content-Range', `bytes ${offset}-${data.length - 1}/${data.length}`); }
    res.end(data.subarray(offset));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/archive`;
  try {
    fs.writeFileSync(archive, data.subarray(0, 10));
    await downloadArchive(url, archive, data.length, hash);
    assert.equal(range, 'bytes=10-');
    assert.deepEqual(fs.readFileSync(archive), data);
    ignoreRange = true;
    fs.writeFileSync(archive, data.subarray(0, 8));
    await downloadArchive(url, archive, data.length, hash);
    assert.deepEqual(fs.readFileSync(archive), data);
    await assert.rejects(downloadArchive(url, archive, data.length, 'bad-hash'), /checksum/);
    assert.equal(fs.existsSync(archive), false);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('service launchers isolate ports and cwd from inherited shell settings', () => {
  const launcher = path.join(__dirname, 'start-service.js');
  for (const [service, port, folder, suffix] of [
    ['api', '5000', 'backend', '../backend/server'],
    ['web', '3000', 'frontend', '../frontend/node_modules/react-scripts/scripts/start'],
  ]) {
    // Intercept just the app import to inspect the real launcher's environment without starting servers.
    const code = `const Module=require('module');const original=Module._load;Module._load=function(id,...args){if(id===${JSON.stringify(suffix)}){const allowedHost=process.argv[2]==='web'?require(${JSON.stringify(path.join(__dirname, '..', 'frontend/node_modules/react-dev-utils/WebpackDevServerUtils'))}).prepareUrls('http','localhost',3000).lanUrlForConfig:null;console.log(JSON.stringify({port:process.env.PORT,cwd:process.cwd(),api:process.env.REACT_APP_API_URL,allowedHost}));return;}return original.call(this,id,...args);};process.argv[2]=${JSON.stringify(service)};require(${JSON.stringify(launcher)});`;
    const result = spawnSync(process.execPath, ['-e', code], { cwd: os.tmpdir(), env: { ...process.env, PORT: '3000' }, encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 0, result.stderr);
    const info = JSON.parse(result.stdout);
    assert.equal(info.port, port);
    assert.equal(info.cwd, path.join(__dirname, '..', folder));
    if (service === 'web') {
      assert.equal(info.api, 'http://localhost:5000/api');
      assert.equal(info.allowedHost, 'localhost');
    }
  }
});

test('the backend loads its own environment file even when launched from another directory', () => {
  const backend = path.join(__dirname, '..', 'backend');
  const code = `const Module=require('module');const original=Module._load;Module._load=function(id,...args){if(id==='dotenv')return {config:options=>{console.log(options.path);process.exit(0)}};return original.call(this,id,...args)};require(${JSON.stringify(path.join(backend, 'server.js'))});`;
  const result = spawnSync(process.execPath, ['-e', code], { cwd: os.tmpdir(), encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), path.join(backend, '.env'));
});
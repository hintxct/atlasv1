// Explicit integration check: starts/stops the actual stack and removes only its test account.
const { fork } = require('child_process');
const { once } = require('events');
const path = require('path');
const assert = require('node:assert/strict');
const { randomUUID } = require('crypto');
const { MongoClient } = require('../backend/node_modules/mongodb');
const { assertPortFree } = require('./start');

const root = path.join(__dirname, '..');
const uri = 'mongodb://127.0.0.1:27017/ne-logistics';
const account = { fullName: 'Startup smoke test', phone: `test-${randomUUID()}`, password: randomUUID(), userType: 'driver', district: 'Kamrup', state: 'Assam' };
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let app;
let createdId;

const start = async () => {
  app = fork(path.join(__dirname, 'start.js'), [], {
    cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    env: { ...process.env, PORT: '3000', MONGODB_URI: uri, CI: 'true', BROWSER: 'none' },
  });
  app.stdout.pipe(process.stdout);
  app.stderr.pipe(process.stderr);
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (app.exitCode !== null) throw new Error(`Startup exited with ${app.exitCode}`);
    try {
      const health = await fetch('http://localhost:5000/api/health', { signal: AbortSignal.timeout(1500) });
      if (health.ok) {
        const web = await fetch('http://localhost:3000/map', { headers: { Accept: 'text/html' }, signal: AbortSignal.timeout(1500) });
        if (web.ok) return;
      }
    } catch { /* Wait for startup, bounded by the deadline. */ }
    await delay(500);
  }
  throw new Error('API did not start within two minutes.');
};

const stop = async () => {
  if (!app || app.exitCode !== null) return;
  const exited = once(app, 'exit');
  app.send('stop');
  const timeout = setTimeout(() => app.kill(), 20000);
  try { await exited; } finally { clearTimeout(timeout); }
};

const request = async (route, body) => {
  const response = await fetch(`http://localhost:5000/api/auth/${route}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(10000),
  });
  assert(response.ok, `${route}: HTTP ${response.status}`);
  return response.json();
};

const run = async () => {
  await start();
  const web = await fetch('http://localhost:3000/map', { headers: { Accept: 'text/html' }, signal: AbortSignal.timeout(90000) });
  assert.equal(web.status, 200);
  const html = await web.text();
  assert(html.includes('id="root"'));
  const bundlePath = html.match(/src="([^"]*bundle\.js)"/)?.[1];
  assert(bundlePath, 'React development bundle is served');
  const bundle = await fetch(new URL(bundlePath, 'http://localhost:3000'), { signal: AbortSignal.timeout(90000) });
  assert.equal(bundle.status, 200);
  assert((await bundle.text()).includes('route intelligence map'), 'Current map page is in the compiled app');
  const created = await request('register', account);
  createdId = created._id;
  assert(created.token && created._id, 'Registration uses MongoDB and JWT');
  await request('login', { phone: account.phone, password: account.password });
  console.log('CHECK: frontend, API, registration, and login passed with inherited PORT=3000.');
  await stop();
  await Promise.all([assertPortFree(3000), assertPortFree(5000)]);
  await start();
  const loggedIn = await request('login', { phone: account.phone, password: account.password });
  assert.equal(loggedIn._id, created._id, 'Account persists across full restart');
  const client = new MongoClient(uri);
  try {
    await client.db().collection('users').deleteOne({ phone: account.phone });
    createdId = null;
  } finally { await client.close(); }
  console.log('CHECK: database persistence across restart passed; test account removed.');
  await stop();
  await Promise.all([assertPortFree(3000), assertPortFree(5000)]);
  console.log('STARTUP SMOKE CHECK PASSED (test processes stopped).');
};

run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (createdId) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 1500 });
    try { await client.db().collection('users').deleteOne({ phone: account.phone }); }
    catch { console.error(`Test account cleanup needed: ${account.phone}`); }
    finally { await client.close(); }
  }
  await stop();
});
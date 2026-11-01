const fs = require('fs');
const path = require('path');
const net = require('net');
const { randomBytes } = require('crypto');
const { spawn } = require('child_process');
const { getLocalPort, ensureMongoBinary } = require('./local-mongo');

const root = path.join(__dirname, '..');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const assertPortFree = (port) => new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', () => reject(new Error(`Port ${port} is in use. Stop the existing app with Ctrl+C in its terminal, then run npm start again.`)));
  probe.listen({ port, exclusive: true }, () => probe.close(resolve));
});

const ensureConfig = (backend, dotenv) => {
  const file = path.join(backend, '.env');
  let contents = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const current = dotenv.parse(contents);
  const defaults = {
    MONGODB_URI: 'mongodb://127.0.0.1:27017/ne-logistics',
    JWT_SECRET: randomBytes(48).toString('hex'),
    SOCKET_CORS_ORIGIN: 'http://localhost:3000',
  };
  for (const [key, value] of Object.entries(defaults)) {
    if (!current[key]) contents += `\n${key}=${value}\n`;
  }
  if (!fs.existsSync(file) || contents !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, contents);
  return { ...dotenv.parse(contents), ...process.env };
};

const main = async () => {
  if (Number(process.versions.node.split('.')[0]) < 18) throw new Error('Use Node.js 18 or newer (Node.js 22 LTS recommended).');
  for (const file of ['node_modules/concurrently/package.json', 'backend/node_modules/mongoose/package.json', 'frontend/node_modules/react-scripts/package.json']) {
    if (!fs.existsSync(path.join(root, file))) throw new Error('Dependencies are missing. Run npm run install-all once, then npm start.');
  }

  // Fail early instead of prompting to move the frontend onto a different port.
  await Promise.all([assertPortFree(3000), assertPortFree(5000)]);
  const dotenv = require('../backend/node_modules/dotenv');
  const concurrently = require('concurrently');
  const { MongoClient } = require('../backend/node_modules/mongodb');
  const config = ensureConfig(path.join(root, 'backend'), dotenv);
  const uri = config.MONGODB_URI;
  const mongoPort = getLocalPort(uri);
  let mongo;
  let mongoError;
  let services;
  let stopping = false;

  const ping = async () => {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 1000, connectTimeoutMS: 1000, family: 4 });
    try {
      await client.db().command({ ping: 1 });
      return true;
    } catch {
      return false;
    } finally {
      await client.close();
    }
  };

  const stopMongo = async () => {
    if (!mongo || mongo.exitCode !== null || mongo.signalCode !== null) return;
    // Gracefully flush the owned local database; never stop an existing external server.
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 1000, socketTimeoutMS: 2000, family: 4 });
    try { await client.db('admin').command({ shutdown: 1 }); } catch { /* MongoDB closes the connection on shutdown. */ }
    finally { await client.close(); }
    const deadline = Date.now() + 10000;
    while (mongo.exitCode === null && mongo.signalCode === null && Date.now() < deadline) await delay(100);
    if (mongo.exitCode === null && mongo.signalCode === null) mongo.kill();
  };

  const stop = () => {
    if (stopping) return;
    stopping = true;
    if (services) services.commands.forEach((command) => command.kill());
    // Wait for child process trees to close before returning the prompt/ports.
    const timeout = setTimeout(() => process.exit(1), 20000);
    const closed = services ? services.result.catch(() => {}) : Promise.resolve();
    closed.then(stopMongo).finally(() => { clearTimeout(timeout); process.exit(0); });
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  // An IPC parent (such as the smoke check) can request the same graceful shutdown.
  const onMessage = (message) => { if (message === 'stop') stop(); };
  if (process.send) process.on('message', onMessage);

  try {
    console.log('[startup] Checking MongoDB…');
    if (!(await ping())) {
      if (!mongoPort) throw new Error('Cannot connect to the configured MongoDB. Check MONGODB_URI, credentials, and network access in backend/.env.');
      await assertPortFree(mongoPort);
      const binary = await ensureMongoBinary(root);
      const data = path.join(root, '.local', 'mongodb-data');
      const log = path.join(root, '.local', 'mongodb.log');
      fs.mkdirSync(data, { recursive: true });
      console.log('[database] Starting local MongoDB (data is saved between runs).');
      mongo = spawn(binary, ['--dbpath', data, '--bind_ip', '127.0.0.1', '--port', String(mongoPort), '--logpath', log, '--logappend'], {
        windowsHide: true, stdio: 'ignore',
      });
      mongo.on('error', (error) => { mongoError = error; });
      let ready = false;
      const deadline = Date.now() + 45000;
      while (Date.now() < deadline) {
        if (mongoError || mongo.exitCode !== null) throw new Error(`Local MongoDB failed to start. See ${log}. ${mongoError?.message || ''}`);
        if (await ping()) { ready = true; break; }
        await delay(500);
      }
      if (!ready) throw new Error(`MongoDB did not become ready within 45 seconds. See ${log}.`);
    }

    console.log('[database] Connected.');
    console.log('\nStarting ATLAS: website http://localhost:3000 | API http://localhost:5000');
    console.log('Wait for "Compiled successfully", then open http://localhost:3000/map');
    console.log('Keep this terminal open. Ctrl+C stops the app.\n');
    const env = {
      MONGODB_URI: uri,
      JWT_SECRET: config.JWT_SECRET,
      SOCKET_CORS_ORIGIN: 'http://localhost:3000',
    };
    services = concurrently([
      { command: `"${process.execPath}" scripts/start-service.js api`, name: 'api', env },
      { command: `"${process.execPath}" scripts/start-service.js web`, name: 'web', env },
    ], { cwd: root, killOthers: ['failure', 'success'], prefix: 'name', restartTries: 0 });
    if (mongo) mongo.once('exit', () => {
      if (!stopping) {
        console.error('[database] MongoDB stopped. Stopping the app; check .local/mongodb.log.');
        services.commands.forEach((command) => command.kill());
      }
    });
    try {
      await services.result;
    } catch (error) {
      if (!stopping) throw error;
    }
  } finally {
    const wasStopping = stopping;
    stopping = true;
    if (!wasStopping) await stopMongo();
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
    process.removeListener('message', onMessage);
    if (process.connected) process.disconnect();
  }
};

if (require.main === module) main().catch((error) => {
  console.error(`\n[startup] ${error.message || 'A service stopped. See the api/web error above.'}`);
  process.exitCode = 1;
});

module.exports = { assertPortFree, ensureConfig };
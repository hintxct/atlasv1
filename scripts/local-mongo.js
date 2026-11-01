const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const { Readable, Transform } = require('stream');
const { pipeline } = require('stream/promises');
const { execFile } = require('child_process');
const { promisify } = require('util');

const run = promisify(execFile);
// Official MongoDB Community archive, pinned and SHA-256 verified before extraction.
const VERSION = '7.0.41';
const ARCHIVE_URL = `https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-${VERSION}.zip`;
const SHA256 = '898778e5201d28131657de8c0433fdbd06213ee05a757243c44087e0ddfa9e1b';
const ARCHIVE_BYTES = 636568452;

const downloadArchive = async (url, archive, expectedBytes, expectedHash) => {
  let received = fs.existsSync(archive) ? fs.statSync(archive).size : 0;
  if (received > expectedBytes) { fs.rmSync(archive); received = 0; }
  if (received < expectedBytes) {
    if (received) console.log(`[database] Resuming download from ${Math.round(received / 1048576)} MB.`);
    const response = await fetch(url, {
      headers: received ? { Range: `bytes=${received}-` } : {},
      signal: AbortSignal.timeout(1200000),
    });
    if (!response.ok) throw new Error(`Download returned HTTP ${response.status}.`);
    if (response.status === 206) {
      const range = response.headers.get('content-range');
      if (!range?.startsWith(`bytes ${received}-`)) throw new Error('Invalid partial download response.');
    } else {
      received = 0; // A server may ignore Range and send the full archive.
    }
    let lastUpdate = 0;
    const progress = new Transform({
      transform(chunk, encoding, callback) {
        received += chunk.length;
        if (Date.now() - lastUpdate > 10000) {
          console.log(`[database] ${Math.round(received / 1048576)} / ${Math.round(expectedBytes / 1048576)} MB (${Math.floor(received / expectedBytes * 100)}%).`);
          lastUpdate = Date.now();
        }
        callback(null, chunk);
      },
    });
    await pipeline(Readable.fromWeb(response.body), progress, fs.createWriteStream(archive, { flags: received ? 'a' : 'w' }));
  }
  if (fs.statSync(archive).size !== expectedBytes) throw new Error('Download incomplete. Run npm start again to resume.');
  const hash = createHash('sha256');
  for await (const chunk of fs.createReadStream(archive)) hash.update(chunk);
  if (hash.digest('hex') !== expectedHash) {
    fs.rmSync(archive, { force: true });
    throw new Error('MongoDB download checksum did not match. Run npm start to download again.');
  }
};

const getLocalPort = (uri) => {
  // Never start an unauthenticated server for a remote, credentialed, or replica-set URI.
  const match = /^mongodb:\/\/(?:127\.0\.0\.1|localhost)(?::(\d+))?\/[^?]+$/.exec(uri || '');
  const port = match ? Number(match[1] || 27017) : null;
  return port > 0 && port <= 65535 ? port : null;
};

const ensureMongoBinary = async (root) => {
  const local = path.join(root, '.local');
  const install = path.join(local, `mongodb-${VERSION}`);
  const binary = path.join(install, `mongodb-win32-x86_64-windows-${VERSION}`, 'bin', 'mongod.exe');
  const complete = path.join(install, '.complete');
  if (fs.existsSync(binary) && fs.existsSync(complete)) return binary;
  if (process.platform !== 'win32' || process.arch !== 'x64') {
    throw new Error('Install MongoDB and start it locally, or set MONGODB_URI in backend/.env. Automatic setup supports Windows x64.');
  }

  fs.mkdirSync(local, { recursive: true });
  const archive = path.join(local, `mongodb-${VERSION}.zip`);
  console.log('[database] First run: downloading MongoDB Community. Future starts use the saved copy.');
  try {
    await downloadArchive(ARCHIVE_URL, archive, ARCHIVE_BYTES, SHA256);
    console.log('[database] Download verified. Extracting the local server…');
    // Environment variables avoid interpolating user-directory characters into PowerShell.
    await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      'Expand-Archive -LiteralPath $env:ATLAS_MONGO_ARCHIVE -DestinationPath $env:ATLAS_MONGO_INSTALL -Force'], {
      windowsHide: true,
      timeout: 180000,
      env: { ...process.env, ATLAS_MONGO_ARCHIVE: archive, ATLAS_MONGO_INSTALL: install },
    });
    if (!fs.existsSync(binary)) throw new Error('MongoDB extraction did not produce mongod.exe.');
    fs.writeFileSync(complete, SHA256);
    fs.rmSync(archive, { force: true });
    return binary;
  } catch (error) {
    // Only remove an incomplete binary install, never the persistent database directory.
    fs.rmSync(install, { recursive: true, force: true });
    throw new Error(`Local MongoDB setup failed: ${error.message}`);
  }
};

module.exports = { getLocalPort, ensureMongoBinary, downloadArchive };
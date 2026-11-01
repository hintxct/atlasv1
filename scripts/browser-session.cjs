// Headless Edge + Chrome DevTools Protocol, using Node built-ins only.
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function browserSession(directory, run) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-browser-'));
  const server = http.createServer((req, res) => {
    let name = path.resolve(directory, '.' + decodeURIComponent(req.url.split('?')[0]));
    if (!name.startsWith(path.resolve(directory) + path.sep) && name !== path.resolve(directory)) { res.writeHead(403); res.end(); return; }
    if (!fs.existsSync(name) || fs.statSync(name).isDirectory()) name = path.join(directory, 'index.html');
    if (!fs.existsSync(name)) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.svg': 'image/svg+xml', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' })[path.extname(name)] || 'application/octet-stream');
    fs.createReadStream(name).pipe(res);
  });
  let browser;
  let ws;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const executable = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
    if (!executable) throw new Error('Microsoft Edge is required for browser checks/image export.');
    browser = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    let spawnError;
    browser.on('error', (error) => { spawnError = error; });
    const marker = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; !fs.existsSync(marker) && i < 100; i++) { if (spawnError) throw spawnError; await wait(100); }
    const port = fs.readFileSync(marker, 'utf8').split('\n')[0];
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    ws = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
    const pending = new Map();
    const events = new Map();
    let sequence = 0;
    ws.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      if (message.id && pending.has(message.id)) {
        const request = pending.get(message.id);
        pending.delete(message.id);
        clearTimeout(request.timer);
        if (message.error) request.reject(new Error(JSON.stringify(message.error)));
        else request.resolve(message.result);
      } else if (events.has(message.method)) events.get(message.method)(message.params);
    });
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out`)); }, 30000);
      pending.set(id, { resolve, reject, timer });
      ws.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async (expression) => {
      const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const until = async (expression, timeout = 20000) => {
      const end = Date.now() + timeout;
      while (Date.now() < end) { if (await evaluate(expression)) return; await wait(150); }
      throw new Error(`Timed out waiting for: ${expression}`);
    };
    await call('Page.enable');
    await call('Runtime.enable');
    await run({ call, evaluate, until, events, wait, base: `http://127.0.0.1:${server.address().port}` });
    await call('Browser.close');
  } finally {
    ws?.close();
    browser?.kill();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await wait(300);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* Edge may briefly hold its temporary profile. */ }
  }
}
module.exports = { browserSession };
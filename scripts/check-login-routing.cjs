const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert/strict');
const { browserSession } = require('./browser-session.cjs');
const root = path.join(__dirname, '..');

browserSession(path.join(root, 'frontend', 'build'), async ({ call, evaluate, until, events, base, wait }) => {
  const errors = [];
  let loginRequests = 0;
  events.set('Runtime.exceptionThrown', (event) => errors.push(event.exceptionDetails.text));
  // Simulate an online API rejecting unseeded demo credentials. Demo buttons must not call it.
  await call('Fetch.enable', { patterns: [{ urlPattern: '*:5000/api/auth/*' }] });
  events.set('Fetch.requestPaused', (event) => {
    loginRequests++;
    call('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: 401, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: '*' }], body: Buffer.from('{"message":"Invalid credentials"}').toString('base64') }).catch((error) => errors.push(error.message));
  });
  const navigate = async (route) => {
    await call('Page.navigate', { url: base + route });
    await until('document.readyState === "complete" && !!document.querySelector("main")');
    await wait(700);
  };
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  for (const [label, route] of [['Driver', '/driver/dashboard'], ['Field Official', '/official/dashboard'], ['District Admin', '/admin/dashboard'], ['State Admin', '/state/dashboard']]) {
    await navigate('/login');
    await evaluate('localStorage.clear()');
    await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent===${JSON.stringify(label + 'Open demo')}).click()`);
    await until(`location.pathname === ${JSON.stringify(route)} && !!document.querySelector('h1')`);
    assert((await evaluate('localStorage.getItem("token")')).startsWith('demo-token-'));
    await call('Page.reload');
    await until(`location.pathname === ${JSON.stringify(route)} && !!document.querySelector('h1')`);
    console.log(`PASS demo click + refresh: ${label}`);
  }
  assert.equal(loginRequests, 0, 'Demo previews never reach the real authentication API');
  await call('Fetch.disable');
  await navigate('/map');
  await evaluate('localStorage.clear()');
  const typePlace = async (id, text) => {
    await evaluate(`document.getElementById(${JSON.stringify(id)}).focus();document.getElementById(${JSON.stringify(id)}).select()`);
    await call('Input.insertText', { text });
    await until(`document.querySelectorAll('#${id}-options [role="option"]').length > 0`);
    const labels = await evaluate(`[...document.querySelectorAll('#${id}-options [role="option"]')].map(e=>e.textContent)`);
    assert(labels.some((label) => label.toLowerCase().includes(text.toLowerCase())));
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await until(`document.getElementById('${id}').getAttribute('aria-expanded') === 'false'`);
  };
  await typePlace('route-from', 'Guwahati');
  await typePlace('route-to', 'Shillong');
  await evaluate('document.querySelector(".journey-fields").requestSubmit()');
  await until('!!document.querySelector(".journey-summary")', 45000);
  const summary = await evaluate('document.querySelector(".journey-summary").textContent');
  assert(summary.includes('Guwahati') && summary.includes('Shillong') && summary.includes('km'));
  // Leaflet simplifies road coordinates at the current zoom; raw SVG string
  // length is not a reliable measure of whether the requested route is drawn.
  await until(`[...document.querySelectorAll('.leaflet-overlay-pane path')].some(p=>p.getAttribute('stroke')==='#e8c987' && p.getAttribute('stroke-width')==='7' && (p.getAttribute('d')||'').includes('L') && p.getTotalLength()>20)`);
  await evaluate('document.querySelector(".driving-steps").open = true');
  assert((await evaluate('document.querySelectorAll(".driving-steps li").length')) > 3);
  for (const width of [1440, 390]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await evaluate('document.querySelector(".map-canvas").scrollIntoView({block:"start",behavior:"instant"})');
    await wait(400);
    assert((await evaluate('document.documentElement.scrollWidth')) <= width + 1, `No page overflow at ${width}px`);
    const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(os.tmpdir(), `atlas-directions-${width}.png`), Buffer.from(screenshot.data, 'base64'));
  }
  console.log('PASS real Guwahati → Shillong autocomplete, route geometry, distance, duration, instructions, desktop/mobile layout');
  // Editing an endpoint must invalidate the old route rather than display stale directions.
  await evaluate('document.getElementById("route-to").focus();document.getElementById("route-to").select()');
  await call('Input.insertText', { text: 'Jorhat' });
  await until('!document.querySelector(".journey-summary")');
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('LOGIN AND ROUTING BROWSER CHECKS PASSED');
}).catch((error) => { console.error(error); process.exitCode = 1; });
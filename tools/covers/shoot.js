const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 760, height: 580 }, deviceScaleFactor: 3 });
  const srv = require('http').createServer((q, r) => { const f = require('path').join(__dirname, decodeURIComponent(q.url.split('?')[0])); require('fs').readFile(f, (e, d) => { if (e) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.html') ? 'text/html' : 'application/json'); r.end(d); }); }).listen(8123);
  for (const s of process.argv.slice(2)) {
    await p.goto(`http://localhost:8123/cover.html?s=${s}`); await p.evaluate(() => go()); await p.waitForSelector('body[data-ready]');
    await p.locator('#m').screenshot({ path: `${s}-raw.png` }); console.log(s);
  }
  await b.close(); srv.close();
})();

/* City twins: type a city, find the city in another country most like it, and draw a card.
   Data: twin/cities.json, built by tools/build_twin_data.py from the GHSL Urban Centre Database R2024A.
   Satellite views: Sentinel-2 cloudless 2024 tiles by EOX. Everything runs in the browser. */
(() => {
  const $ = id => document.getElementById(id);
  if (!$('twin-card')) return;
  const T_ = s => (window.I18N && window.I18N[s]) || s, ROOT = window.SITE_ROOT || '';
  const nf = new Intl.NumberFormat('en-GB');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const INK = '#141412', INK2 = '#55544e', GREY = '#6a6963', FAINT = '#77766f', RULE = '#d6d5cf';
  const SERIF = 'Newsreader', SANS = 'Satoshi', MONO = '"Geist Mono"';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the seven measures a twin is matched on (same order as the data builder's standardisation)
  const feats = r => [r[6], Math.log(r[7] + 1), r[8], r[9], r[10], Math.log(r[5]), Math.log(r[4])];
  // the six that can be shown as the shared trait: value, format, trait at the high end, trait at the low end
  const MEAS = [
    [r => r[6], v => v.toFixed(1), 'sun', 'snow'],
    [r => r[7], v => nf.format(v), 'rain', 'dunes'],
    [r => r[8], v => v.toFixed(1), 'seasons', 'even'],
    [r => r[9], v => v.toFixed(2), 'trees', 'stone'],
    [r => r[10], v => v.toFixed(1), 'towers', 'low'],
    [r => r[5], v => nf.format(v), 'crowd', 'sparse'],
  ];
  // colour, headline when both are in the most extreme 15 %, softer headline otherwise, the line with the numbers, scale ends
  const T = {
    sun:     ['#e8552b', 'Two of the world’s hottest cities.', 'Two cities hotter than most.', (A, B, x, y, p) => `${A} and ${B} average ${x} and ${y} °C over the year, hotter than ${p}% of the world’s large cities.`, ['COOL', 'HOT']],
    snow:    ['#2f6db5', 'Two of the world’s coolest cities.', 'Two cities cooler than most.', (A, B, x, y, p) => `${A} and ${B} average ${x} and ${y} °C over the year, cooler than ${p}% of the world’s large cities.`, ['COOL', 'HOT']],
    rain:    ['#0f8b8d', 'Two of the world’s wettest cities.', 'Two cities wetter than most.', (A, B, x, y, p) => `${A} and ${B} get ${x} and ${y} mm of rain a year, more than ${p}% of the world’s large cities.`, ['DRY', 'WET']],
    dunes:   ['#d9661a', 'Two of the world’s driest cities.', 'Two cities drier than most.', (A, B, x, y, p) => `${A} and ${B} get just ${x} and ${y} mm of rain a year, less than ${p}% of the world’s large cities.`, ['DRY', 'WET']],
    seasons: ['#c2366b', 'Two cities with fierce seasons.', 'Two cities with stronger seasons than most.', (A, B, x, y, p) => `Monthly mean temperatures in ${A} and ${B} spread by ${x} and ${y} °C (standard deviation), more than in ${p}% of the world’s large cities.`, ['STEADY', 'SEASONAL']],
    even:    ['#d97f0c', 'Two cities where every month feels alike.', 'Two cities with steadier temperatures than most.', (A, B, x, y, p) => `Monthly mean temperatures in ${A} and ${B} spread by just ${x} and ${y} °C (standard deviation), steadier than in ${p}% of the world’s large cities.`, ['STEADY', 'SEASONAL']],
    trees:   ['#3f8f29', 'Two cities with the world’s lushest greenery.', 'Two cities with lusher greenery than most.', (A, B, x, y, p) => `The greener ground in and around ${A} and ${B} averages ${x} and ${y} on the satellite vegetation index (NDVI), higher than in ${p}% of the world’s large cities.`, ['GREY', 'GREEN']],
    stone:   ['#9a5f34', 'Two cities with the world’s least lush greenery.', 'Two cities with less lush greenery than most.', (A, B, x, y, p) => `The greener ground in and around ${A} and ${B} averages just ${x} and ${y} on the satellite vegetation index (NDVI), lower than in ${p}% of the world’s large cities.`, ['GREY', 'GREEN']],
    towers:  ['#5b3df5', 'Two of the world’s tallest-built cities.', 'Two cities built taller than most.', (A, B, x, y, p) => `Buildings in ${A} and ${B} average ${x} and ${y} m tall, taller than in ${p}% of the world’s large cities.`, ['LOW', 'TALL']],
    low:     ['#c8434f', 'Two cities that stay close to the ground.', 'Two cities built lower than most.', (A, B, x, y, p) => `Buildings in ${A} and ${B} average just ${x} and ${y} m tall, lower than in ${p}% of the world’s large cities.`, ['LOW', 'TALL']],
    crowd:   ['#e23d64', 'Two of the world’s most crowded cities.', 'Two cities more crowded than most.', (A, B, x, y, p) => `${A} and ${B} pack ${x} and ${y} people into every km², more than ${p}% of the world’s large cities.`, ['SPARSE', 'CROWDED']],
    sparse:  ['#2a9d8f', 'Two of the world’s most spread-out cities.', 'Two cities more spread out than most.', (A, B, x, y, p) => `${A} and ${B} hold just ${x} and ${y} people per km², a lower density than in ${p}% of the world’s large cities.`, ['SPARSE', 'CROWDED']],
  };

  let R, M, Z, PCT, cur = 0, order = [], k = 0, drawId = 0, frame = 0, last = null;

  function km(a, b) {
    const t = Math.PI / 180, dla = (b[3] - a[3]) * t, dlo = (b[2] - a[2]) * t;
    const h = Math.sin(dla / 2) ** 2 + Math.cos(a[3] * t) * Math.cos(b[3] * t) * Math.sin(dlo / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(h));
  }
  // nearest cities in other countries, by distance across the seven standardised measures
  function twinsOf(i) {
    const zi = Z[i], cn = R[i][1], d = [];
    for (let j = 0; j < R.length; j++) {
      if (R[j][1] === cn) continue;
      let s = 0; for (let f = 0; f < 7; f++) { const e = Z[j][f] - zi[f]; s += e * e; }
      d.push([Math.sqrt(s), j]);
    }
    return d.sort((a, b) => a[0] - b[0]).slice(0, 10);
  }
  // the shared trait: both on the same side of the middle, chosen where the less extreme of the two is furthest out
  function shared(i, j) {
    let best = null;
    for (let f = 0; f < MEAS.length; f++) {
      const a = PCT[f][i], b = PCT[f][j];
      if ((a - 50) * (b - 50) <= 0) continue;
      const hi = a > 50, edge = hi ? Math.min(a, b) : Math.max(a, b), strength = Math.abs(edge - 50);
      if (!best || strength > best.strength) best = { f, hi, strength, key: MEAS[f][hi ? 2 : 3] };
    }
    if (best) {
      // share of all cities strictly beyond the less extreme of the two, rounded down so it never overclaims
      const get = MEAS[best.f][0], va = get(R[i]), vb = get(R[j]), v = best.hi ? Math.min(va, vb) : Math.max(va, vb);
      let n = 0; for (const r of R) { const x = get(r); if (best.hi ? x < v : x > v) n++; }
      best.p = Math.floor(100 * n / R.length); best.top = 100 - best.p;
    }
    return best;
  }

  // ---------- satellite views ----------
  const tiles = new Map();
  const tile = (z, x, y) => {
    const key = `${z}/${y}/${x}`;
    if (!tiles.has(key)) {
      const load = n => new Promise(res => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => res(n ? load(n - 1) : null);
        i.src = `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/${key}.jpg`; });
      tiles.set(key, load(1).then(img => { if (!img) tiles.delete(key); return img; }));
    }
    return tiles.get(key);
  };
  async function view(r, size, z) {
    const n = 2 ** z, la = r[3] * Math.PI / 180;
    const x = (r[2] + 180) / 360 * n * 256, y = (1 - Math.log(Math.tan(la) + 1 / Math.cos(la)) / Math.PI) / 2 * n * 256;
    const x0 = x - size / 2, y0 = y - size / 2, c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'); g.fillStyle = '#e9e9e6'; g.fillRect(0, 0, size, size);
    const jobs = [];
    for (let tx = Math.floor(x0 / 256); tx <= Math.floor((x0 + size) / 256); tx++)
      for (let ty = Math.floor(y0 / 256); ty <= Math.floor((y0 + size) / 256); ty++)
        jobs.push(tile(z, ((tx % n) + n) % n, ty).then(img => img && g.drawImage(img, tx * 256 - x0, ty * 256 - y0)));
    await Promise.all(jobs);
    try { stretch(c); } catch (e) { /* a tile failed to load cross-origin; draw as is */ }
    return c;
  }
  // a gentle contrast stretch from the 2nd to 98th percentile of brightness
  function stretch(c) {
    const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height), px = d.data, hist = new Uint32Array(256);
    for (let i = 0; i < px.length; i += 4) hist[(px[i] * 77 + px[i + 1] * 150 + px[i + 2] * 29) >> 8]++;
    const n = px.length / 4; let acc = 0, lo = 0, hi = 255;
    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc < n * .02) lo = v; if (acc < n * .98) hi = v; }
    const kk = Math.min(1.6, 255 / Math.max(20, hi - lo));
    for (let i = 0; i < px.length; i += 4) for (let ch = 0; ch < 3; ch++) px[i + ch] = Math.max(0, Math.min(255, .45 * px[i + ch] + .55 * (px[i + ch] - lo) * kk));
    g.putImageData(d, 0, 0);
  }

  // ---------- text helpers ----------
  function spaced(g, str, x, y, sp, align = 'left') {
    const w = [...str].reduce((s, ch) => s + g.measureText(ch).width + sp, -sp);
    let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    const ta = g.textAlign; g.textAlign = 'left';
    for (const ch of str) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; }
    g.textAlign = ta; return w;
  }
  function fitFont(g, str, tpl, size, maxW, min = 24) { do { g.font = tpl.replace('{s}', size); size -= 2; } while (g.measureText(str).width > maxW && size > min); }
  function wrap(g, str, maxW) { const out = []; let line = ''; for (const w of str.split(' ')) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } out.push(line); return out; }
  const ease = t => 1 - Math.pow(1 - t, 3);
  const seg = (t, a, b) => ease(Math.max(0, Math.min(1, (t - a) / (b - a))));

  // ---------- the card ----------
  function render(F, t) {
    const { a, b, s, va, vb, ci, bj } = F;
    const W = 1080, H = 1350, cv = $('twin-card'), g = cv.getContext('2d');
    const [C, strong, weak, explain, ends] = s ? T[s.key] : ['#141412', 'Two close matches.', '', () => '', null];
    g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, W, H); g.textAlign = 'left'; g.globalAlpha = 1;
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    // dot grid, faded out behind the words
    g.fillStyle = '#e4e3dd'; for (let y = 27; y < H; y += 27) for (let x = 27; x < W; x += 27) { g.beginPath(); g.arc(x, y, 1.6, 0, Math.PI * 2); g.fill(); }
    g.save(); g.translate(W / 2, 1010); g.scale(1.3, .62); const fade = g.createRadialGradient(0, 0, 0, 0, 0, 430);
    fade.addColorStop(0, '#fff'); fade.addColorStop(.7, '#fff'); fade.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = fade; g.fillRect(-430, -430, 860, 860); g.restore();

    g.fillStyle = GREY; g.font = `400 20px ${MONO}`; spaced(g, 'CITY TWINS', W / 2, 92, 6, 'center');

    const R0 = 190, cy = 380, xs = [W / 2 - 286, W / 2 + 286], dist = nf.format(Math.round(km(a, b) / 10) * 10);
    const coord = r => `${Math.abs(r[3]).toFixed(2)}°${r[3] >= 0 ? 'N' : 'S'}  ${Math.abs(r[2]).toFixed(2)}°${r[2] >= 0 ? 'E' : 'W'}`;
    // hairline drawing out from both lenses
    const hl = seg(t, .35, .75), x1 = xs[0] + R0 + 16, x2 = xs[1] - R0 - 16, mid = W / 2;
    g.strokeStyle = RULE; g.lineWidth = 2; g.beginPath(); g.moveTo(x1, cy); g.lineTo(x1 + (mid - x1) * hl, cy); g.moveTo(x2, cy); g.lineTo(x2 - (x2 - mid) * hl, cy); g.stroke();

    [[va, xs[0], a, 0], [vb, xs[1], b, .12]].forEach(([v, x, r, d]) => {
      const open = seg(t, d, d + .5);
      // the view opens like an aperture
      g.save(); g.beginPath(); g.arc(x, cy, Math.max(.1, R0 * open), 0, Math.PI * 2); g.clip();
      g.filter = 'saturate(1.12)'; const sc = 1.08 - .08 * open; g.drawImage(v, x - v.width * sc / 2, cy - v.height * sc / 2, v.width * sc, v.height * sc); g.filter = 'none';
      const vg = g.createRadialGradient(x, cy, R0 * .6, x, cy, R0); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.18)'); g.fillStyle = vg; g.fillRect(x - R0, cy - R0, 2 * R0, 2 * R0);
      g.restore();
      // scale ring, drawn round
      const ring = seg(t, d, d + .6);
      g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.arc(x, cy, R0 + 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke();
      for (let i = 0; i < 72 * ring; i++) { const ang = -Math.PI / 2 + i * Math.PI / 36, l = i % 18 === 0 ? 14 : i % 6 === 0 ? 8 : 4;
        g.lineWidth = i % 18 === 0 ? 2 : 1; g.beginPath(); g.moveTo(x + Math.cos(ang) * (R0 + 12), cy + Math.sin(ang) * (R0 + 12)); g.lineTo(x + Math.cos(ang) * (R0 + 12 + l), cy + Math.sin(ang) * (R0 + 12 + l)); g.stroke(); }
      g.globalAlpha = open; g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 12, cy); g.lineTo(x + 12, cy); g.moveTo(x, cy - 12); g.lineTo(x, cy + 12); g.stroke();
      // name and position
      const fade = seg(t, d + .2, d + .6); g.globalAlpha = fade; const lift = (1 - fade) * 10;
      g.textAlign = 'center'; g.fillStyle = INK; fitFont(g, r[0], `500 {s}px ${SERIF}`, 50, 2 * R0 + 40); g.fillText(r[0], x, cy + R0 + 92 + lift);
      g.fillStyle = GREY; const cl = (r[1] + '  ·  ' + coord(r)).toUpperCase(); let cs = 22; do { g.font = `400 ${cs}px ${MONO}`; cs -= 1; } while ([...cl].reduce((n, ch) => n + g.measureText(ch).width + 2, 0) > 2 * R0 + 60 && cs > 15); spaced(g, cl, x, cy + R0 + 132 + lift, 2, 'center');
      g.textAlign = 'left'; g.globalAlpha = 1;
    });
    // distance label
    g.globalAlpha = seg(t, .6, .85); g.font = `400 21px ${MONO}`; const dl = dist + ' KM';
    const dw = [...dl].reduce((n, ch) => n + g.measureText(ch).width + 3, 0) + 20;
    g.fillStyle = '#fff'; g.fillRect(W / 2 - dw / 2, cy - 19, dw, 38); g.fillStyle = INK2; spaced(g, dl, W / 2, cy + 7, 3, 'center'); g.globalAlpha = 1;

    // headline and the line that explains it
    const head = s ? (s.top <= 15 ? strong : weak) : strong;
    const sub = s ? explain(a[0], b[0], MEAS[s.f][1](MEAS[s.f][0](a)), MEAS[s.f][1](MEAS[s.f][0](b)), s.p) : 'Close on heat, rain, seasons, greenery, building height, crowding and size.';
    let y = 880; const tf = seg(t, .45, .85); g.globalAlpha = tf; const lift = (1 - tf) * 14;
    g.textAlign = 'center'; g.fillStyle = INK; let hs = 62, lines;
    do { g.font = `500 ${hs}px ${SERIF}`; lines = wrap(g, head, W - 200); hs -= 2; } while ((lines.length > 2 || (lines.length === 2 && !lines[1].includes(' '))) && hs > 46);
    hs += 2; lines.slice(0, 2).forEach((l, n) => g.fillText(l, W / 2, y + lift + n * (hs + 8))); y += (Math.min(lines.length, 2) - 1) * (hs + 8) + 66;
    g.fillStyle = INK2; g.font = `400 32px ${SANS}`; wrap(g, sub, W - 200).slice(0, 3).forEach((l, n) => g.fillText(l, W / 2, y + lift + n * 46));
    g.textAlign = 'left'; g.globalAlpha = 1;

    if (s) {
      // where both cities sit among all cities, on the shared measure
      const sy = H - 186, L = W / 2 - 260, Rr = W / 2 + 260, pos = q => L + 14 + (Rr - L - 28) * q / 100;
      const sf = seg(t, .6, 1); g.globalAlpha = Math.min(1, sf * 1.5);
      g.strokeStyle = RULE; g.lineWidth = 2; g.beginPath(); g.moveTo(L, sy); g.lineTo(Rr, sy); g.stroke();
      for (let i = 0; i <= 10; i++) { g.beginPath(); g.moveTo(pos(i * 10), sy - (i % 5 ? 4 : 8)); g.lineTo(pos(i * 10), sy + (i % 5 ? 4 : 8)); g.stroke(); }
      g.fillStyle = GREY; g.font = `400 19px ${MONO}`; spaced(g, ends[0], L - 22, sy + 7, 3, 'right'); spaced(g, ends[1], Rr + 22, sy + 7, 3);
      const pa = 50 + (PCT[s.f][ci] - 50) * sf, pb = 50 + (PCT[s.f][bj] - 50) * sf;
      g.beginPath(); g.arc(pos(pa), sy, 9, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
      g.beginPath(); g.arc(pos(pb), sy, 8, 0, Math.PI * 2); g.fillStyle = C; g.fill();
      // key
      g.font = `400 20px ${MONO}`; const la = a[0].toUpperCase(), lb = b[0].toUpperCase();
      const tw = q => [...q].reduce((n, ch) => n + g.measureText(ch).width + 3, -3);
      let lx = W / 2 - (22 + tw(la) + 44 + 22 + tw(lb)) / 2; const ly = H - 100;
      g.beginPath(); g.arc(lx + 7, ly - 5, 7, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
      g.fillStyle = INK2; spaced(g, la, lx + 22, ly, 3); lx += 22 + tw(la) + 44;
      g.beginPath(); g.arc(lx + 7, ly - 5, 7, 0, Math.PI * 2); g.fillStyle = C; g.fill();
      g.fillStyle = INK2; spaced(g, lb, lx + 22, ly, 3); g.globalAlpha = 1;
    }
    // credit, so a saved card carries it
    g.globalAlpha = 1; g.fillStyle = GREY; g.font = `400 15px ${SANS}`; g.textAlign = 'center';
    g.fillText('Sentinel-2 cloudless – s2maps.eu by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2024), CC BY-NC-SA 4.0 · GHS-UCDB R2024A, EC JRC, CC BY 4.0', W / 2, H - 34, W - 80);
    g.textAlign = 'left';
    return { head, sub, dist };
  }

  // before the first views arrive: the frame of the card, so it is never blank
  function skeleton() {
    const g = $('twin-card').getContext('2d'), W = 1080, H = 1350; g.setTransform(2, 0, 0, 2, 0, 0);
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#e4e3dd'; for (let y = 27; y < H; y += 27) for (let x = 27; x < W; x += 27) { g.beginPath(); g.arc(x, y, 1.6, 0, Math.PI * 2); g.fill(); }
    [W / 2 - 286, W / 2 + 286].forEach(x => { g.beginPath(); g.arc(x, 380, 190, 0, Math.PI * 2); g.fillStyle = '#efeeea'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#dcdbd5'; g.beginPath(); g.arc(x, 380, 202, 0, Math.PI * 2); g.stroke(); });
    g.fillStyle = '#efeeea'; [[W / 2 - 300, 860, 600, 44], [W / 2 - 220, 920, 440, 44], [W / 2 - 330, 1000, 660, 18], [W / 2 - 240, 1036, 480, 18]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
  }
  async function draw() {
    const id = ++drawId, a = R[cur], [, j] = order[k], b = R[j], s = shared(cur, j);
    const stage = $('twin-stage'); stage.classList.add('loading'); stage.setAttribute('aria-busy', 'true'); $('twin-save').setAttribute('aria-disabled', 'true');
    if (!last) skeleton();
    const [va, vb] = await Promise.all([view(a, 400, 12), view(b, 400, 12)]);
    if (id !== drawId) return;
    stage.classList.remove('loading'); stage.removeAttribute('aria-busy'); $('twin-save').removeAttribute('aria-disabled');
    if (!reduce) { stage.classList.remove('swap', 'from-l', 'from-r'); void stage.offsetWidth; stage.classList.add('swap', dirn > 0 ? 'from-r' : dirn < 0 ? 'from-l' : 'swap'); dirn = 0; }
    const F = last = { a, b, s, va, vb, ci: cur, bj: j };
    cancelAnimationFrame(frame);
    const words = render(F, reduce ? 1 : 0);
    if (!reduce) { const t0 = performance.now(), dur = 1500; const step = now => { const t = Math.min(1, (now - t0) / dur); render(F, t); if (t < 1 && id === drawId) frame = requestAnimationFrame(step); }; frame = requestAnimationFrame(step); }
    $('twin-card').setAttribute('aria-label', `${a[0]}, ${a[1]} and ${b[0]}, ${b[1]}, ${words.dist} km apart. ${words.head} ${words.sub}`);
    $('twin-rank').textContent = `${a[0]} and ${b[0]}`;
    facts(a, b, s);
    if (touched) { const u = new URL(location.href); u.searchParams.set('city', a[0] + ', ' + a[1]); u.searchParams.set('id', a[12]); u.searchParams.delete('n'); u.hash = 'twin'; history.replaceState(null, '', u); }
  }
  let touched = false, dirn = 0;
  // the left-hand table: both cities on all seven measures, the shared trait marked
  const ROWS = [
    ['Temperature', r => r[6].toFixed(1) + '\u00a0°C', 0],
    ['Rainfall', r => nf.format(r[7]) + '\u00a0mm', 1],
    ['Seasonal spread (SD)', r => r[8].toFixed(1) + '\u00a0°C', 2],
    ['Greenness (NDVI)', r => r[9].toFixed(2), 3],
    ['Building height', r => r[10].toFixed(1) + '\u00a0m', 4],
    ['People per km²', r => nf.format(r[5]), 5],
    ['Population', r => r[4] >= 1e6 ? (r[4] / 1e6).toFixed(1) + '\u00a0M' : nf.format(Math.round(r[4] / 1e3)) + '\u00a0K', 6],
  ];
  function facts(a, b, s) {
    const t = $('twin-facts'), C = s ? T[s.key][0] : INK;
    t.style.setProperty('--tw-c', C);
    t.innerHTML = `<thead><tr><th scope="col"><span class="sr-only">${esc(T_('Measure'))}</span></th><th scope="col"><i class="tw-k tw-k--a" aria-hidden="true"></i>${esc(a[0])}</th><th scope="col"><i class="tw-k" aria-hidden="true"></i>${esc(b[0])}</th></tr></thead><tbody>`
      + ROWS.map(([label, f, m], n) => `<tr${s && s.f === m ? ' class="hit"' : ''} style="--n:${n}"><th scope="row">${esc(T_(label))}</th><td>${f(a)}</td><td>${f(b)}</td></tr>`).join('')
      + `</tbody>`;
  }
  function pick(i, kk = 0, user = true) { touched = touched || user; cur = i; order = twinsOf(i); k = Math.max(0, Math.min(Math.floor(kk) || 0, order.length - 1)); draw(); }

  // ---------- buttons ----------
  $('twin-save').addEventListener('click', () => {
    if (!last || $('twin-stage').classList.contains('loading')) return; cancelAnimationFrame(frame); render(last, 1); const fname = last.a[0];
    $('twin-card').toBlob(bl => { if (!bl) return; const a = document.createElement('a'); a.download = 'city-twins-' + fname.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png';
      a.href = URL.createObjectURL(bl); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      const btn = $('twin-save'), was = btn.querySelector('.tw-l').textContent; btn.querySelector('.tw-l').textContent = T_('Saved'); btn.classList.add('done'); setTimeout(() => { btn.querySelector('.tw-l').textContent = was; btn.classList.remove('done'); }, 1600); }, 'image/png');
  });
  $('twin-share').addEventListener('click', async () => {
    const btn = $('twin-share').querySelector('.tw-l'), was = btn.textContent;
    try { if (navigator.share) await navigator.share({ title: 'City twins', url: shareUrl() }); else { await navigator.clipboard.writeText(shareUrl()); btn.textContent = T_('Link copied'); } }
    catch (e) { /* closed or blocked */ }
    setTimeout(() => btn.textContent = was, 1600);
  });


  // ---------- search ----------
  // same name and country more than once (e.g. Portland, United States): show population to tell them apart
  let dup = new Set();
  const popShort = v => v >= 1e6 ? (v / 1e6).toFixed(1) + ' M' : Math.round(v / 1e3) + ' K';
  const q = $('twin-q'), list = $('twin-sugg'); let hits = [], sel = -1;
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const shut = () => { list.hidden = true; q.setAttribute('aria-expanded', 'false'); q.removeAttribute('aria-activedescendant'); };
  q.addEventListener('input', () => {
    if (!R) return;
    const t = norm(q.value.trim()); sel = -1;
    hits = t.length < 2 ? [] : R.map((r, i) => [r, i]).filter(([r]) => { const n = norm(r[0]); return n.startsWith(t) || n.includes(' ' + t) || n.includes('-' + t); }).slice(0, 7);
    list.innerHTML = hits.map(([r], n) => `<li role="option" id="o${n}" aria-selected="false" data-n="${n}">${esc(r[0])}<span>${esc(r[1])}${dup.has(r[0] + '|' + r[1]) ? ' · ' + popShort(r[4]) : ''}</span></li>`).join('')
      || (t.length >= 2 ? '<li class="none" role="option" aria-disabled="true">' + T_('No city by that name. Try a larger city nearby.') + '</li>' : '');
    list.hidden = t.length < 2; q.setAttribute('aria-expanded', String(!list.hidden));
  });
  const choose = n => { if (!hits[n]) return; pick(hits[n][1]); q.value = ''; hits = []; shut(); $('twin-save').focus({ preventScroll: true }); };
  list.addEventListener('mousedown', e => { const li = e.target.closest('li[data-n]'); if (li) { e.preventDefault(); choose(+li.dataset.n); } });
  q.addEventListener('keydown', e => {
    if (e.key === 'Escape') { hits = []; return shut(); }
    if (!hits.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
      [...list.children].forEach((li, n) => li.setAttribute('aria-selected', String(n === sel))); q.setAttribute('aria-activedescendant', 'o' + sel); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(sel < 0 ? 0 : sel); }
  });
  q.addEventListener('blur', () => setTimeout(shut, 120));
  $('twin-find').addEventListener('submit', e => e.preventDefault());
  if (!reduce) {
    const names = ['Lagos', 'Nairobi', 'São Paulo', 'Jakarta', 'Berlin', 'Lima', 'Accra', 'Osaka'];
    let ni = 0, ci = 0, dir = 1, idle = true, tick; const was0 = q.placeholder;
    const stop = () => { idle = false; clearTimeout(tick); q.placeholder = was0; };
    q.addEventListener('focus', stop, { once: true });
    const type = () => {
      if (!idle) return; const w = names[ni];
      ci += dir; q.placeholder = T_('Try:') + ' ' + w.slice(0, ci);
      if (dir > 0 && ci >= w.length) { dir = -1; tick = setTimeout(type, 1400); return; }
      if (dir < 0 && ci <= 0) { dir = 1; ni = (ni + 1) % names.length; tick = setTimeout(type, 350); return; }
      tick = setTimeout(type, dir > 0 ? 90 : 40);
    };
    tick = setTimeout(type, 1600);
  }

  function start() {
  Promise.all([fetch(ROOT + 'twin/cities.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }), document.fonts.load(`500 40px ${SERIF}`), document.fonts.load(`400 20px ${SANS}`), document.fonts.load(`400 20px ${MONO}`)]).then(([d]) => {
    R = d.rows; M = d.meta;
    const seen = new Set(); R.forEach(r => { const key = r[0] + '|' + r[1]; if (seen.has(key)) dup.add(key); seen.add(key); });
    Z = R.map(r => feats(r).map((v, f) => (v - M.feature_mean[f]) / M.feature_sd[f]));
    // percentile of every city on each measure: share of cities below it, ties counted half
    PCT = MEAS.map(([get]) => { const v = R.map(get), s = [...v].sort((p, q) => p - q);
      const bound = (x, le) => { let lo = 0, hi = s.length; while (lo < hi) { const m = (lo + hi) >> 1; (le ? s[m] <= x : s[m] < x) ? lo = m + 1 : hi = m; } return lo; };
      return v.map(x => 100 * (bound(x, false) + bound(x, true)) / 2 / s.length); });
    const sp = new URLSearchParams(location.search), want = sp.get('city'), id = +sp.get('id');
    let i = id ? R.findIndex(r => r[12] === id && (!want || r[0] + ', ' + r[1] === want)) : -1;
    if (i < 0 && want) i = R.findIndex(r => r[0] + ', ' + r[1] === want);
    if (id && i >= 0 && R[i][12] !== id) { const u = new URL(location.href); u.searchParams.set('id', R[i][12]); history.replaceState(null, '', u); }
    if (want && i < 0) { const u = new URL(location.href); ['city', 'id', 'n'].forEach(x => u.searchParams.delete(x)); history.replaceState(null, '', u); }
    if (i < 0) i = R.findIndex(r => r[0] === 'Lagos' && r[1] === 'Nigeria');
    pick(i, 0, false);
  }).catch(() => { $('twin-stage').classList.add('failed'); $('twin-rank').textContent = T_('The city data could not be loaded. Please reload the page.'); $('twin-rank').className = 'tw-err'; });
  }
  function shareUrl() { const u = new URL(location.href); u.search = ''; u.searchParams.set('city', R[cur][0] + ', ' + R[cur][1]); u.searchParams.set('id', R[cur][12]); u.hash = 'twin'; return u.href; }
  // load the data and imagery only when the section is about to be seen
  if (new URLSearchParams(location.search).get('city') || !('IntersectionObserver' in window)) start();
  else { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '600px 0px' }); io.observe($('twin')); }
})();

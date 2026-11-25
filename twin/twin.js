/* City twins: type a city, find a city in another country with the same climate and a similar size,
   and draw a card that contrasts how the two have grown and built.
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

  // fields in cities.json: 0 name, 1 country, 2 lon, 3 lat, 4 population 2025, 5 mean temperature (C, 2010s),
  // 6 seasonality (SD of monthly means, C), 7 greenness (NDVI 2025), 8 building height (m, 2020), 9 Koppen class,
  // 10 GHSL id, 11 population 1975..2025 every 5 years
  // a twin: same Koppen climate class, another country, closest in temperature, seasonality and size
  const feats = r => [r[5], r[6], Math.log(r[4])];
  const KOP = ['', 'tropical rainforest', 'tropical monsoon', 'tropical savanna', 'hot desert', 'cold desert', 'hot semi-arid', 'cold semi-arid', 'hot-summer Mediterranean', 'warm-summer Mediterranean', 'cold-summer Mediterranean', 'humid subtropical, dry winter', 'subtropical highland', 'cold subtropical highland', 'humid subtropical', 'oceanic', 'subpolar oceanic', 'hot-summer continental, dry summer', 'warm-summer continental, dry summer', 'subarctic, dry summer', 'very cold subarctic, dry summer', 'hot-summer continental, dry winter', 'warm-summer continental, dry winter', 'subarctic, dry winter', 'very cold subarctic, dry winter', 'hot-summer continental', 'warm-summer continental', 'subarctic', 'very cold subarctic', 'tundra', 'ice cap'];
  const ZONE = k => k <= 3 ? '#d9485f' : k <= 7 ? '#c96a1b' : k <= 16 ? '#3d8b3a' : k <= 28 ? '#2f6db5' : '#5b4fd6';
  // growth since 1975 only where the 1975 population was at least 10,000; below that the modelled ratio is not meaningful
  // and only where the ratio is not an implausible collapse (below 0.25 the modelled 1975 figure is not credible)
  const growth = r => { if (r[11][0] < 1e4) return null; const g = r[11][r[11].length - 1] / r[11][0]; return g >= .25 ? g : null; };
  const fx = v => new Intl.NumberFormat('en', { maximumFractionDigits: v >= 9.95 ? 0 : v >= 1 ? 1 : 2, minimumFractionDigits: v >= 9.95 ? 0 : v >= 1 ? 1 : 2 }).format(v) + '×';
  const pop = v => v >= 1e6 ? (v / 1e6).toFixed(1) + '\u00a0M' : v >= 1e3 ? nf.format(Math.round(v / 1e3)) + '\u00a0K' : nf.format(Math.round(v));
  // the table follows the page language for numbers; the card stays English
  const nl = new Intl.NumberFormat(document.documentElement.lang || 'en');
  const num = (v, d, lang) => new Intl.NumberFormat(lang || document.documentElement.lang || 'en', { minimumFractionDigits: d, maximumFractionDigits: d }).format(Object.is(v, -0) || Math.abs(v) < Math.pow(10, -d) / 2 ? 0 : v);
  const en = (v, d) => num(v, d, 'en');

  let R, M, Z, cur = 0, order = [], k = 0, drawId = 0, frame = 0, last = null;

  function km(a, b) {
    const t = Math.PI / 180, dla = (b[3] - a[3]) * t, dlo = (b[2] - a[2]) * t;
    const h = Math.sin(dla / 2) ** 2 + Math.cos(a[3] * t) * Math.cos(b[3] * t) * Math.sin(dlo / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(h));
  }
  // compared in tenths of a degree so the limits are exact for the values shown on the card
  const sameClimate = (a, b) => a[9] === b[9] && Math.abs(Math.round(a[5] * 10) - Math.round(b[5] * 10)) <= 20 && Math.abs(Math.round(a[6] * 10) - Math.round(b[6] * 10)) <= 10;
  const similarSize = (a, b) => Math.max(a[4], b[4]) <= 1.5 * Math.min(a[4], b[4]);
  // nearest cities in other countries with the same climate class; any class if a city's class is unique
  function twinsOf(i) {
    const zi = Z[i], cn = R[i][1], kc = R[i][9];
    // first choice: same climate type, average temperature within 2 °C, seasonal spread within 1 °C, population within 1.5 times;
    // if no city meets all three, the closest city of the same climate type (or any type) is used and the card says so
    const strict = j => sameClimate(R[i], R[j]) && similarSize(R[i], R[j]);
    const near = (same, tight) => { const d = []; for (let j = 0; j < R.length; j++) {
      if (R[j][1] === cn || (same && R[j][9] !== kc) || (tight && !strict(j)) || km(R[i], R[j]) < 50) continue;
      let s = 0; for (let f = 0; f < 3; f++) { const e = Z[j][f] - zi[f]; s += e * e; } d.push([Math.sqrt(s), j]); }
      return d.sort((a, b) => a[0] - b[0]).slice(0, 10); };
    // the tier is kept with the list so the page can say how close the match is
    let o = near(true, true), tier = 'close'; if (!o.length) { o = near(true, false); tier = 'class'; } if (!o.length) { o = near(false, false); tier = 'any'; }
    o.tier = tier; return o;
  }
  // the clearest difference between the two, reported with both values: growth since 1975, building height or greenness
  // only differences large enough to stand above the uncertainty of these satellite estimates count:
  // growth at least 1.5 times, building height at least 30 % and 2 m apart, greenness at least 0.08 NDVI apart
  // values are compared as integers (tenths of a metre, thousandths of NDVI) so the cut-offs are exact;
  // 2.5 m is the floor of the height data, so a city at the floor never makes a height story
  function contrast(a, b) {
    const ga = growth(a), gb = growth(b), c = [];
    if (ga && gb && Math.max(ga, gb) > 1 && Math.max(ga, gb) / Math.min(ga, gb) >= 1.5) c.push(['growth', Math.log(Math.max(ga, gb) / Math.min(ga, gb))]);
    const ha = Math.round(a[8] * 10), hb = Math.round(b[8] * 10);
    if (ha > 25 && hb > 25 && Math.max(ha, hb) * 10 >= Math.min(ha, hb) * 13 && Math.abs(ha - hb) >= 20) c.push(['height', Math.log(Math.max(ha, hb) / Math.min(ha, hb))]);
    const na = Math.round(a[7] * 1000), nb = Math.round(b[7] * 1000);
    if (Math.abs(na - nb) >= 80) c.push(['green', Math.abs(na - nb) / 250]);
    return c.length ? c.sort((p, q) => q[1] - p[1])[0][0] : 'alike';
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
  function fitFont(g, str, tpl, size, maxW, min = 24) { g.font = tpl.replace('{s}', size); while (g.measureText(str).width > maxW && size > min) { size = Math.max(min, size - 2); g.font = tpl.replace('{s}', size); } }
  function wrap(g, str, maxW) { const out = []; let line = ''; for (const w of str.split(' ')) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } out.push(line); return out; }
  const ease = t => 1 - Math.pow(1 - t, 3);
  const seg = (t, a, b) => ease(Math.max(0, Math.min(1, (t - a) / (b - a))));

  // ---------- the card ----------
  function render(F, t) {
    const { a, b, va, vb } = F;
    const W = 1080, H = 1350, cv = $('twin-card'), g = cv.getContext('2d'), C = ZONE(a[9]);
    g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, W, H); g.textAlign = 'left'; g.globalAlpha = 1;
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    // dot grid, faded out behind the words
    g.fillStyle = '#e4e3dd'; for (let y = 27; y < H; y += 27) for (let x = 27; x < W; x += 27) { g.beginPath(); g.arc(x, y, 1.6, 0, Math.PI * 2); g.fill(); }
    g.save(); g.translate(W / 2, 960); g.scale(1.3, .62); const fade = g.createRadialGradient(0, 0, 0, 0, 0, 430);
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
      g.textAlign = 'center'; g.fillStyle = INK; let nm = r[0]; fitFont(g, nm, `500 {s}px ${SERIF}`, 50, 2 * R0 + 20, 28);
      while (g.measureText(nm).width > 2 * R0 + 20 && nm.length > 4) nm = nm.slice(0, -2).trimEnd() + '…';
      g.fillText(nm, x, cy + R0 + 92 + lift);
      g.fillStyle = GREY; let cl = r[1].toUpperCase(), cs = 21; const sw = () => [...cl].reduce((n, ch) => n + g.measureText(ch).width + 2, 0);
      do { g.font = `400 ${cs}px ${MONO}`; cs -= 1; } while (sw() > 2 * R0 + 30 && cs > 16);
      while (sw() > 2 * R0 + 30 && cl.length > 4) cl = cl.slice(0, -2).trimEnd() + '…';
      spaced(g, cl, x, cy + R0 + 130 + lift, 2, 'center');
      g.font = `400 19px ${MONO}`; spaced(g, coord(r), x, cy + R0 + 160 + lift, 2, 'center');
      g.textAlign = 'left'; g.globalAlpha = 1;
    });
    // distance label
    g.globalAlpha = seg(t, .6, .85); g.font = `400 21px ${MONO}`; const dl = dist + ' KM';
    const dw = [...dl].reduce((n, ch) => n + g.measureText(ch).width + 3, 0) + 20;
    g.fillStyle = '#fff'; g.fillRect(W / 2 - dw / 2, cy - 19, dw, 38); g.fillStyle = INK2; spaced(g, dl, W / 2, cy + 7, 3, 'center'); g.globalAlpha = 1;

    // headline: same climate, then the clearest difference
    const sameK = a[9] === b[9], ga = growth(a), gb = growth(b);
    const art = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
    const nA = a[0] === b[0] ? `${a[0]} (${a[1]})` : a[0], nB = a[0] === b[0] ? `${b[0]} (${b[1]})` : b[0];
    const close = sameClimate(a, b), similar = similarSize(a, b);
    const opener = (close ? 'Same climate' : sameK ? 'Same climate type' : 'Nearest climate') + (similar ? ', similar size' : '');
    const head = opener + ({
      growth: `. ${ga > gb ? nA : nB} grew faster.`,
      height: `. ${a[8] > b[8] ? nA : nB} builds taller.`,
      green: `. ${a[7] > b[7] ? nA : nB} has greener built-up areas.`,
      alike: similar ? '. Close on every measure compared.' : ', close on every measure compared.',
    })[F.c];
    const clim = (sameK ? `Both have ${art(KOP[a[9]])} climate (${en(a[5], 1)} and ${en(b[5], 1)}\u00a0°C on average)` : `They average ${en(a[5], 1)} and ${en(b[5], 1)}\u00a0°C`)
      + ` and about ${pop(a[4])} and ${pop(b[4])} people.`;
    const gline = () => `Population change since 1975: ${nA} ${fx(ga)}, ${nB} ${fx(gb)}.`;
    const sub = clim + ' ' + ({
      growth: gline,
      height: () => `Average building height: ${en(a[8], 1)}\u00a0m in ${nA}, ${en(b[8], 1)}\u00a0m in ${nB}.`,
      green: () => `Mean NDVI of the greener built-up land: ${en(a[7], 2)} in ${nA}, ${en(b[7], 2)} in ${nB}.`,
      alike: () => ga && gb ? gline() : 'Growth, building height and greenness are all within the margins.',
    })[F.c]();
    // a weak match says so on the card itself, above the headline, so a shared card cannot overstate it
    const weak = order.tier && order.tier !== 'close' ? (order.tier === 'class' ? 'No close match \u00b7 closest with the same climate type' : 'No close match \u00b7 no city shares this climate type') : '';
    const cav = weak ? 56 : 0;
    // the words get the room above the chart; shrink until headline and sub fit
    const top0 = cy + R0 + 222 + cav, limit = H - 330;
    let hs = 58, ss = 30, lines, sl, hgt;
    // never cut words: shrink until the headline fits in two lines and the sub in three, above the chart
    for (;;) {
      g.font = `500 ${hs}px ${SERIF}`; lines = wrap(g, head, W - 180);
      if (lines.length === 2 && !lines[1].includes(' ')) { const w = head.split(' '); const alt = [w.slice(0, -2).join(' '), w.slice(-2).join(' ')]; if (g.measureText(alt[0]).width <= W - 180) lines = alt; }
      g.font = `400 ${ss}px ${SANS}`; sl = wrap(g, sub, W - 180);
      hgt = lines.length * (hs + 8) + 18 + sl.length * (ss + 12);
      if ((top0 + hgt <= limit && lines.length <= 2 && sl.length <= 3) || (hs <= 36 && ss <= 20)) break;
      if (hs > 36) hs -= 2; if (ss > 20) ss -= 1;
    }
    const tf = seg(t, .45, .85); g.globalAlpha = tf; const lift = (1 - tf) * 14; let y = top0 + hs;
    if (weak) { g.textAlign = 'center'; g.fillStyle = '#9a3412'; g.font = `500 22px ${MONO}`; spaced(g, weak.toUpperCase(), W / 2, top0 - 22 + lift, 2, 'center'); }
    g.textAlign = 'center'; g.fillStyle = INK; g.font = `500 ${hs}px ${SERIF}`;
    lines.forEach((l, n) => g.fillText(l, W / 2, y + lift + n * (hs + 8))); y += (lines.length - 1) * (hs + 8) + 18 + ss + 6;
    g.fillStyle = INK2; g.font = `400 ${ss}px ${SANS}`; sl.forEach((l, n) => g.fillText(l, W / 2, y + lift + n * (ss + 12)));
    g.textAlign = 'left'; g.globalAlpha = 1;

    // people since 1975 (modelled), only when both 1975 figures are credible; otherwise say so instead of drawing it
    const cf = seg(t, .55, 1), years = M.years;
    if (ga && gb) {
      const cx0 = 250, cx1 = W - 250, cyB = H - 176, cyT = H - 270;
      const all = [...a[11], ...b[11]].map(v => Math.max(v, 1e3)), lo = Math.log(Math.min(...all)), hiV = Math.log(Math.max(...all));
      const px = i => cx0 + (cx1 - cx0) * i / (years.length - 1), py = v => cyB - (cyB - cyT) * (Math.log(Math.max(v, 1e3)) - lo) / Math.max(hiV - lo, .7);
      g.globalAlpha = Math.min(1, cf * 1.6);
      g.strokeStyle = RULE; g.lineWidth = 2; g.beginPath(); g.moveTo(cx0, cyB + 14); g.lineTo(cx1, cyB + 14); g.stroke();
      g.fillStyle = GREY; g.font = `400 19px ${MONO}`; spaced(g, String(years[0]), cx0, cyB + 44, 2, 'center'); spaced(g, String(years[years.length - 1]), cx1, cyB + 44, 2, 'center');
      spaced(g, 'PEOPLE, ' + years[0] + '–' + years[years.length - 1] + ' (MODELLED)', cx0 - 26, cyT - 22, 3);
      const n = Math.max(1, Math.round((years.length - 1) * cf));
      [[a[11], INK, false], [b[11], C, true]].forEach(([sr, col, fill]) => {
        g.strokeStyle = col; g.lineWidth = 3.5; g.lineJoin = 'round'; g.beginPath(); sr.slice(0, n + 1).forEach((v, i) => i ? g.lineTo(px(i), py(v)) : g.moveTo(px(i), py(v))); g.stroke();
        const X = px(n), Yy = py(sr[n]); g.beginPath(); g.arc(X, Yy, fill ? 8 : 9, 0, Math.PI * 2); g.fillStyle = fill ? col : '#fff'; g.fill(); if (!fill) { g.lineWidth = 3; g.strokeStyle = col; g.stroke(); }
      });
      if (cf >= 1) { g.font = `400 19px ${MONO}`; const la = py(a[4]), lb = py(b[4]), gap = Math.abs(la - lb) < 26 ? (la < lb ? -13 : 13) : 0;
        g.fillStyle = INK; spaced(g, pop(a[4]).replace('\u00a0', ' '), cx1 + 22, la + 7 + gap, 2); g.fillStyle = INK2; spaced(g, pop(b[4]).replace('\u00a0', ' '), cx1 + 22, lb + 7 - gap, 2); }
    } else {
      g.globalAlpha = Math.min(1, cf * 1.6); g.fillStyle = GREY; g.font = `400 22px ${SANS}`; g.textAlign = 'center';
      const odd = [!ga && a, !gb && b].filter(Boolean).map(r => r === a ? nA : nB).join(' and ');
      wrap(g, `Population history not shown: the modelled 1975 figure for ${odd} is not reliable.`, W - 200).slice(0, 2).forEach((l, n) => g.fillText(l, W / 2, H - 226 + n * 32));
      g.textAlign = 'left';
    }
    // key
    g.font = `400 19px ${MONO}`; const cut = q => q.length > 22 ? q.slice(0, 20).trimEnd() + '…' : q, ka = cut(a[0]).toUpperCase(), kb = cut(b[0]).toUpperCase();
    const tw = q => [...q].reduce((m, ch) => m + g.measureText(ch).width + 3, -3);
    let lx = W / 2 - (22 + tw(ka) + 44 + 22 + tw(kb)) / 2; const ly = H - 84;
    g.beginPath(); g.arc(lx + 7, ly - 5, 7, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
    g.fillStyle = INK2; spaced(g, ka, lx + 22, ly, 3); lx += 22 + tw(ka) + 44;
    g.beginPath(); g.arc(lx + 7, ly - 5, 7, 0, Math.PI * 2); g.fillStyle = C; g.fill();
    g.fillStyle = INK2; spaced(g, kb, lx + 22, ly, 3); g.globalAlpha = 1;
    // credit, so a saved card carries it
    g.globalAlpha = 1; g.fillStyle = GREY; g.font = `400 16px ${SANS}`; g.textAlign = 'center';
    g.fillText('Imagery: Sentinel-2 cloudless – s2maps.eu by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2024), CC BY-NC-SA 4.0', W / 2, H - 46);
    g.fillText('Data: GHS Urban Centre Database R2024A, European Commission JRC, CC BY 4.0 · all population figures are modelled', W / 2, H - 22);
    g.textAlign = 'left';
    return { head: weak ? weak + '. ' + head : head, sub, dist, plainHead: head };
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
    const id = ++drawId, a = R[cur], [, j] = order[k], b = R[j];
    const stage = $('twin-stage'); stage.classList.add('loading'); stage.setAttribute('aria-busy', 'true'); $('twin-save').setAttribute('aria-disabled', 'true');
    if (!last) skeleton();
    const [va, vb] = await Promise.all([view(a, 400, 12), view(b, 400, 12)]);
    if (id !== drawId) return;
    stage.classList.remove('loading'); stage.removeAttribute('aria-busy'); $('twin-save').removeAttribute('aria-disabled');
    if (!reduce) { stage.classList.remove('swap', 'from-l', 'from-r'); void stage.offsetWidth; stage.classList.add('swap', dirn > 0 ? 'from-r' : dirn < 0 ? 'from-l' : 'swap'); dirn = 0; }
    const F = last = { a, b, va, vb, c: contrast(a, b) };
    cancelAnimationFrame(frame);
    const words = render(F, reduce ? 1 : 0);
    if (!reduce) { const t0 = performance.now(), dur = 1500; const step = now => { const t = Math.min(1, (now - t0) / dur); render(F, t); if (t < 1 && id === drawId) frame = requestAnimationFrame(step); }; frame = requestAnimationFrame(step); }
    const tw = $('twin-words'); if (tw) tw.innerHTML = `${words.head !== words.plainHead ? `<span class="tw-wk">${esc(words.head.slice(0, words.head.length - words.plainHead.length - 2))}</span>` : ''}<strong>${esc(words.plainHead)}</strong> ${esc(words.sub)}`;
    $('twin-card').setAttribute('aria-label', `${a[0]}, ${a[1]} and ${b[0]}, ${b[1]}, ${words.dist} km apart. ${words.head} ${words.sub}`);
    $('twin-rank').textContent = `${a[0]} ${T_('and')} ${b[0]}`;
    facts(a, b, F.c); match(a, b);
    if (touched) { const u = new URL(location.href); u.searchParams.set('city', a[0] + ', ' + a[1]); u.searchParams.set('id', a[10]); u.searchParams.set('t', b[10]); u.searchParams.delete('n'); u.hash = 'twin'; history.replaceState(null, '', u); }
  }
  let touched = false, dirn = 0;
  // the left-hand table: both cities side by side, the clearest difference marked
  const popL = v => v >= 1e6 ? num(v / 1e6, 1) + '\u00a0M' : v >= 1e3 ? nl.format(Math.round(v / 1e3)) + '\u00a0K' : nl.format(Math.round(v));
  const ROWS = [
    ['Climate type', r => esc(T_(KOP[r[9]])), ''],
    ['Temperature', r => num(r[5], 1) + '\u00a0°C', ''],
    ['Seasonal spread (SD)', r => num(r[6], 1) + '\u00a0°C', ''],
    ['Population 1975', r => popL(r[11][0]), '', 'modelled'],
    ['Population 2025', r => popL(r[4]), '', 'modelled'],
    ['Change since 1975', r => { const v = growth(r); return v ? num(v, v >= 9.95 ? 0 : v >= 1 ? 1 : 2) + '×' : '–'; }, 'growth'],
    ['Building height', r => num(r[8], 1) + '\u00a0m', 'height'],
    ['Greenness (NDVI)', r => num(r[7], 2), 'green'],
  ];
  function facts(a, b, c) {
    const t = $('twin-facts'); t.style.setProperty('--tw-c', ZONE(a[9]));
    t.innerHTML = `<thead><tr><th scope="col"><span class="sr-only">${esc(T_('Measure'))}</span></th><th scope="col"><i class="tw-k tw-k--a" aria-hidden="true"></i>${esc(a[0])}</th><th scope="col"><i class="tw-k" aria-hidden="true"></i>${esc(b[0])}</th></tr></thead><tbody>`
      + ROWS.map(([label, f, m, tag], n) => `<tr${m && m === c ? ' class="hit"' : ''} style="--n:${n}"><th scope="row">${esc(T_(label))}${tag ? ` <span class="tw-tag">${esc(T_(tag))}</span>` : ''}</th><td>${f(a)}</td><td>${f(b)}</td></tr>`).join('')
      + `</tbody>`;
  }
  // why this twin: the matching tests with their differences and limits, the tier, and the other candidates
  function match(a, b) {
    const el = $('twin-match'); if (!el) return;
    const dT = Math.abs(Math.round(a[5] * 10) - Math.round(b[5] * 10)) / 10, dS = Math.abs(Math.round(a[6] * 10) - Math.round(b[6] * 10)) / 10;
    const ratio = Math.max(a[4], b[4]) / Math.min(a[4], b[4]), sameK = a[9] === b[9];
    const ok = v => `<span class="${v ? 'tw-in' : 'tw-out'}">${esc(T_(v ? 'within' : 'outside'))}</span>`;
    const rows = [[T_('Climate type'), esc(T_(sameK ? 'same' : 'different')), esc(T_('must match')), ok(sameK)],
      [T_('Temperature'), `${num(dT, 1)}\u00a0°C`, '2\u00a0°C', ok(dT <= 2)],
      [T_('Seasonal spread (SD)'), `${num(dS, 1)}\u00a0°C`, '1\u00a0°C', ok(dS <= 1)],
      [T_('Population 2025'), `${num(ratio, ratio >= 10 ? 0 : 1)}×`, '1.5×'.replace('.', num(1.5, 1).charAt(1)), ok(ratio <= 1.5)]];
    const tier = { close: 'Close match: every limit below is met.', class: 'No close match: no city in another country meets every limit, so this is the closest city with the same climate type. Read the differences as real differences.', any: 'No city in another country shares this climate type, so this is the closest city of any type.' }[order.tier || 'close'];
    const others = order.map(([, j], i) => [i, j]).filter(([i]) => i !== k).slice(0, 4);
    el.innerHTML = `<h2 class="tw-mh">${esc(T_('Why this twin'))}</h2><p class="tw-tier${order.tier === 'close' ? '' : ' weak'}">${esc(T_(tier))}</p>
      <table class="tw-mt"><thead><tr><th scope="col"><span class="sr-only">${esc(T_('Measure'))}</span></th><th scope="col">${esc(T_('Difference'))}</th><th scope="col">${esc(T_('Limit'))}</th><th scope="col"><span class="sr-only">${esc(T_('Result'))}</span></th></tr></thead><tbody>${
        rows.map(([l, d, lim, o]) => `<tr><th scope="row">${esc(l)}</th><td>${d}</td><td>${lim}</td><td>${o}</td></tr>`).join('')}</tbody></table>
      <p class="tw-note">${esc(T_('Ranked by temperature, seasonal spread and population, weighted equally.'))}</p>
      ${others.length ? `<h2 class="tw-mh">${esc(T_('Other candidates'))}</h2><div class="tw-alt">${others.map(([i, j]) => `<button type="button" data-k="${i}">${esc(R[j][0])}<span>${esc(R[j][1])}</span></button>`).join('')}</div>` : ''}`;
    el.querySelectorAll('[data-k]').forEach(btn => btn.addEventListener('click', () => { dirn = +btn.dataset.k > k ? 1 : -1; k = +btn.dataset.k; touched = true; draw(); }));
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
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[\u2010-\u2015\u2212_-]+/g, ' ').replace(/\s+/g, ' ').trim(); // hyphens and dashes match spaces: Ilara-Mokin = Ilara Mokin
  const shut = () => { list.hidden = true; q.setAttribute('aria-expanded', 'false'); q.removeAttribute('aria-activedescendant'); };
  // names and countries are normalised once, not on every key press (11,403 cities)
  let NAMES = null, COUNTRIES = null;
  const lev = (a, b, max) => {   // edit distance, stopped once it passes max
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let p = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const r = [i]; let lo = i;
      for (let j = 1; j <= b.length; j++) { r[j] = Math.min(p[j] + 1, r[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); lo = Math.min(lo, r[j]); }
      if (lo > max) return max + 1; p = r;
    }
    return p[b.length];
  };
  q.addEventListener('input', () => {
    if (!R) return;
    if (!NAMES) { NAMES = R.map(r => norm(r[0])); COUNTRIES = R.map(r => norm(r[1])); }
    const t = norm(q.value.trim()); sel = -1; let near = false;
    // name matches first; then a country name, which lists that country's largest cities (rows are not sorted, so by population)
    const rank = i => { const n = NAMES[i]; return n === t ? 0 : n.startsWith(t) ? 1 : n.includes(' ' + t) ? 2 : COUNTRIES[i] === t || (t.length >= 4 && COUNTRIES[i].startsWith(t)) ? 3 : 9; };
    hits = t.length < 2 ? [] : R.map((r, i) => [r, i, rank(i)]).filter(h => h[2] < 9)
      .sort((p, q) => p[2] - q[2] || (p[2] === 3 ? q[0][4] - p[0][4] : p[1] - q[1])).slice(0, 7);
    if (!hits.length && t.length >= 3) {   // no name starts with what was typed: offer the closest spellings, largest city first on ties
      const max = t.length <= 4 ? 1 : t.length <= 8 ? 2 : 3;
      hits = R.map((r, i) => [r, i, lev(t, NAMES[i].slice(0, Math.max(t.length, Math.min(NAMES[i].length, t.length + 2))), max)])
        .filter(h => h[2] <= max).sort((p, q) => p[2] - q[2] || q[0][4] - p[0][4]).slice(0, 5);
      near = hits.length > 0;
    }
    list.innerHTML = (near ? '<li class="none" role="presentation">' + T_('No exact match. Closest names:') + '</li>' : '')
      + hits.map(([r], n) => `<li role="option" id="o${n}" aria-selected="false" data-n="${n}">${esc(r[0])}<span>${esc(r[1])}${dup.has(r[0] + '|' + r[1]) ? ' · ' + popShort(r[4]) : ''}</span></li>`).join('')
      || (t.length >= 2 ? '<li class="none" role="option" aria-disabled="true">' + T_('No city by that name. Try a larger city nearby.') + '</li>' : '');
    list.hidden = t.length < 2; q.setAttribute('aria-expanded', String(!list.hidden));
  });
  const choose = n => { if (!hits[n]) return; pick(hits[n][1]); q.value = ''; hits = []; shut(); $('twin-save').focus({ preventScroll: true }); };
  list.addEventListener('mousedown', e => { const li = e.target.closest('li[data-n]'); if (li) { e.preventDefault(); choose(+li.dataset.n); } });
  q.addEventListener('keydown', e => {
    if (e.key === 'Escape') { hits = []; return shut(); }
    if (!hits.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
      [...list.querySelectorAll('li[data-n]')].forEach(li => li.setAttribute('aria-selected', String(+li.dataset.n === sel))); q.setAttribute('aria-activedescendant', 'o' + sel); }
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
    const sp = new URLSearchParams(location.search), want = sp.get('city'), id = +sp.get('id');
    let i = id ? R.findIndex(r => r[10] === id && (!want || r[0] + ', ' + r[1] === want)) : -1;
    if (i < 0 && want) i = R.findIndex(r => r[0] + ', ' + r[1] === want);
    if (id && i >= 0 && R[i][10] !== id) { const u = new URL(location.href); u.searchParams.set('id', R[i][10]); history.replaceState(null, '', u); }
    if (want && i < 0) { const u = new URL(location.href); ['city', 'id', 't', 'n'].forEach(x => u.searchParams.delete(x)); history.replaceState(null, '', u); }
    if (i < 0) i = R.findIndex(r => r[0] === 'Lagos' && r[1] === 'Nigeria');
    const tw = +sp.get('t'), kk = tw ? twinsOf(i).findIndex(([, j]) => R[j][10] === tw) : -1;
    pick(i, Math.max(0, kk), false);
  }).catch(() => { $('twin-stage').classList.add('failed'); $('twin-rank').textContent = T_('The city data could not be loaded. Please reload the page.'); $('twin-rank').className = 'tw-err'; });
  }
  function shareUrl() { const u = new URL(location.href); u.search = ''; u.searchParams.set('city', R[cur][0] + ', ' + R[cur][1]); u.searchParams.set('id', R[cur][10]); if (order[k]) u.searchParams.set('t', R[order[k][1]][10]); u.hash = 'twin'; return u.href; }
  // load the data and imagery only when the section is about to be seen
  if (new URLSearchParams(location.search).get('city') || !('IntersectionObserver' in window)) start();
  else { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '600px 0px' }); io.observe($('twin')); }
})();

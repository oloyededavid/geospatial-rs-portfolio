/* The hero: Earth through time, from the Big Bang to today, with a tick scrubber beneath it.
   Canvas only, no libraries. Surfaces are generated from noise; "Today" uses assets/earth.jpg.
   Plays on its own until the visitor drags or uses the arrow keys. Reduced motion: no spin, no autoplay. */
(() => {
    const fig = document.querySelector('.globe'), cv = fig && fig.querySelector('canvas'); if (!cv) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, D = Math.PI / 180;

    const ST = [
        { t: '13.8 billion years ago', h: 'Big Bang', s: 'The universe begins', k: 'sun', lon: 0 },
        { t: '4.6 billion years ago', h: 'Protoplanet', s: 'Dust and rock collide', k: 'proto', lon: 0 },
        { t: '4.5 billion years ago', h: 'Magma ocean', s: 'The surface is molten', k: 'magma', lon: 0 },
        { t: '4.4 billion years ago', h: 'First oceans', s: 'Steam falls as rain', k: 'oceans', lon: 0 },
        { t: '3.5 billion years ago', h: 'First life', s: 'Microbes under a hazy sky', k: 'life', lon: 0 },
        { t: '2.4 billion years ago', h: 'Great Oxidation', s: 'Oxygen fills the air', k: 'oxid', lon: 0 },
        { t: '1 billion years ago', h: 'Rodinia', s: 'No plants yet on land', k: 'rodinia', lon: -20 },
        { t: '650 million years ago', h: 'Snowball Earth', s: 'Ice reaches the equator', k: 'snow', lon: 0 },
        { t: '540 million years ago', h: 'Cambrian explosion', s: 'Animals fill the seas', k: 'cambrian', lon: 30 },
        { t: '385 million years ago', h: 'First forests', s: 'Plants spread over land', k: 'forest', lon: -10 },
        { t: '250 million years ago', h: 'Pangaea', s: 'One supercontinent', k: 'pangaea', lon: 10 },
        { t: '66 million years ago', h: 'Chicxulub', s: 'An asteroid ends the age of dinosaurs', k: 'chix', lon: -80 },
        { t: '20,000 years ago', h: 'Last Ice Age', s: 'Ice sheets cover the north', k: 'iceage', lon: -45 },
        { t: 'Today', h: 'Earth', s: '8 billion people', k: 'today', lon: 15 },
    ];
    const N = ST.length, LAST = N - 1;

    // ---------- canvas geometry ----------
    const S = 480, CX = 240, CY = 216, R = 148, TILT = 12 * D;
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');
    const SW = 2 * R + 2, sph = document.createElement('canvas'); sph.width = sph.height = SW;
    const sctx = sph.getContext('2d'), img = sctx.createImageData(SW, SW), out = img.data;

    // per-pixel view geometry, computed once
    const TW = 512, TH = 256;
    const px = [];                       // flat records: index, v (texture row, float), lonOff (deg), light, spec, rim, alpha
    {
        const L = norm(-0.45, 0.5, 0.75), Hh = norm(L[0], L[1], L[2] + 1);
        const ct = Math.cos(TILT), st = Math.sin(TILT);
        for (let y = 0; y < SW; y++) for (let x = 0; x < SW; x++) {
            const nx = (x + 0.5 - SW / 2) / R, ny = -(y + 0.5 - SW / 2) / R, r2 = nx * nx + ny * ny;
            const dist = Math.sqrt(r2) * R; if (dist > R + 0.5) continue;
            const a = Math.min(1, R + 0.5 - dist), cl = Math.min(r2, 1), nz = Math.sqrt(1 - cl);
            const lat = Math.asin(Math.max(-1, Math.min(1, ny * ct + nz * st)));
            const lo = Math.atan2(nx, nz * ct - ny * st);
            const d = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
            const sp = Math.pow(Math.max(0, nx * Hh[0] + ny * Hh[1] + nz * Hh[2]), 60);
            px.push((y * SW + x) * 4, (90 - lat / D) / 180 * TH - 0.5, lo / D, 0.42 + 0.7 * d, sp, 1 - nz, a);
        }
    }
    function norm(x, y, z) { const l = Math.hypot(x, y, z); return [x / l, y / l, z / l]; }

    // ---------- noise ----------
    const P = new Uint8Array(512); { let s = 7; const p = [...Array(256).keys()];
        for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
        for (let i = 0; i < 512; i++) P[i] = p[i & 255]; }
    const hv = (i, j, k) => P[P[P[i & 255] + (j & 255)] + (k & 255)] / 255;
    const sm = t => t * t * (3 - 2 * t), lerp = (a, b, t) => a + (b - a) * t;
    function vnoise(x, y, z) {
        const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), u = sm(x - xi), v = sm(y - yi), w = sm(z - zi);
        return lerp(lerp(lerp(hv(xi, yi, zi), hv(xi + 1, yi, zi), u), lerp(hv(xi, yi + 1, zi), hv(xi + 1, yi + 1, zi), u), v),
                    lerp(lerp(hv(xi, yi, zi + 1), hv(xi + 1, yi, zi + 1), u), lerp(hv(xi, yi + 1, zi + 1), hv(xi + 1, yi + 1, zi + 1), u), v), w);
    }
    function fbm(x, y, z, o) { let s = 0, a = 0.5, n = 0; for (let i = 0; i < o; i++) { s += a * vnoise(x, y, z); n += a; x *= 2.03; y *= 2.03; z *= 2.03; a *= 0.5; } return s / n; }
    const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
    const angDeg = (la1, lo1, la2, lo2) => Math.acos(Math.max(-1, Math.min(1,
        Math.sin(la1 * D) * Math.sin(la2 * D) + Math.cos(la1 * D) * Math.cos(la2 * D) * Math.cos((lo1 - lo2) * D)))) / D;

    // ---------- surfaces ----------
    let earth = null, land = null;       // earth.jpg resampled to TW x TH, and its land mask
    const SURF = {
        sun(x, y, z) { const n = fbm(x * 2.6 + 9, y * 2.6, z * 2.6, 5), m = fbm(x * 6, y * 6 + 3, z * 6, 3);
            return mix([255, 249, 232], [246, 166, 58], ss(0.42, 0.72, n * 0.75 + m * 0.25)); },
        proto(x, y, z) { const n = fbm(x * 3 + 2, y * 3, z * 3, 5), c = fbm(x * 9, y * 9 + 5, z * 9, 3), g = fbm(x * 16 + 7, y * 16, z * 16, 2);
            let col = mix([34, 31, 29], [92, 84, 76], ss(0.3, 0.75, n)); col = mix(col, [120, 110, 98], ss(0.66, 0.74, c) * 0.6);
            return mix(col, [255, 160, 55], ss(0.72, 0.78, g)); },
        magma(x, y, z) { const n = fbm(x * 3, y * 3 + 1, z * 3, 4), m = 1 - Math.abs(2 * fbm(x * 4.5 + 3, y * 4.5, z * 4.5, 4) - 1);
            const col = mix([112, 24, 12], [205, 72, 26], ss(0.35, 0.7, n)); return mix(col, [255, 205, 90], ss(0.86, 0.95, m)); },
        oceans(x, y, z) { const n = fbm(x * 3, y * 3, z * 3 + 4, 4), c = fbm(x * 3.2 + 5, y * 3.2, z * 3.2, 5), v = fbm(x * 15, y * 15, z * 15 + 2, 2);
            let col = mix([20, 28, 36], [42, 54, 64], n); col = mix(col, [236, 240, 243], ss(0.55, 0.66, c));
            return mix(col, [240, 130, 50], ss(0.8, 0.84, v) * 0.9); },
        life(x, y, z) { const n = fbm(x * 3, y * 3 + 2, z * 3, 4), i = fbm(x * 4 + 8, y * 4, z * 4, 5);
            const col = mix([16, 84, 78], [32, 122, 106], n); return mix(col, [150, 112, 62], ss(0.67, 0.71, i)); },
        oxid(x, y, z) { const n = fbm(x * 3, y * 3, z * 3 + 6, 4), r = fbm(x * 3.4 + 1, y * 3.4, z * 3.4, 5);
            const col = mix([22, 60, 150], [40, 92, 190], n); return mix(col, mix([200, 86, 48], [150, 56, 36], n), ss(0.6, 0.64, r)); },
        snow(x, y, z, lat) { const n = fbm(x * 5, y * 5, z * 5, 4), w = fbm(x * 4 + 3, y * 4, z * 4, 4);
            const col = mix([214, 227, 237], [245, 248, 251], n); return mix(col, [104, 160, 198], ss(0.6, 0.64, w) * ss(26, 12, Math.abs(lat))); },
        pangaea(x, y, z, lat, lon) {
            const n = fbm(x * 3 + 4, y * 3, z * 3, 5), sp = fbm(x * 22, y * 22, z * 22, 2);
            const d = angDeg(lat, lon, 2, 0), r = 58 + 26 * (n - 0.5) * 2;
            const bite = angDeg(lat, lon, 4, 52) < 26 + 10 * (n - 0.5);
            const ocean = mix([22, 64, 150], [44, 104, 196], ss(70, 0, Math.abs(lat)));
            if (d > r || bite) return ocean;
            const sand = mix([206, 180, 130], [230, 206, 158], sp);
            return mix(sand, [70, 150, 58], ss(r - 16, r - 4, d));
        },
        chix(x, y, z, lat, lon, u, v) {
            const n = fbm(x * 6, y * 6, z * 6, 4), ocean = mix([22, 64, 150], [44, 104, 196], ss(70, 0, Math.abs(lat)));
            let col = land && land[v * TW + u] ? mix([56, 140, 54], [96, 168, 72], n) : ocean;
            const a = angDeg(lat, lon, 21.3, -89.5);
            col = mix(col, [255, 186, 90], ss(9, 1.5, a)); return mix(col, [255, 252, 228], ss(2.6, 0.8, a));
        },
        rodinia(x, y, z, lat, lon) {
            const n = fbm(x * 2.6 + 11, y * 2.6, z * 2.6, 5), sp = fbm(x * 20 + 3, y * 20, z * 20, 3);
            const d = angDeg(lat * 1.35, lon, -6, -20), r = 52 + 30 * (n - 0.5) * 2;
            const ocean = mix([24, 66, 152], [44, 104, 196], ss(70, 0, Math.abs(lat)));
            if (d > r) return mix(ocean, [64, 150, 190], ss(r + 8, r, d) * 0.6);
            return mix(mix([118, 92, 74], [160, 128, 98], sp), [92, 74, 62], ss(0.55, 0.75, n) * 0.6);
        },
        cambrian(x, y, z, lat) {
            const n = fbm(x * 2.2 + 21, y * 2.2, z * 2.2, 5), sp = fbm(x * 20, y * 20 + 9, z * 20, 3);
            const ocean = mix([24, 66, 152], [44, 104, 196], ss(70, 0, Math.abs(lat)));
            if (n < 0.56) return mix(ocean, [70, 168, 196], ss(0.5, 0.56, n) * 0.75);
            return mix([150, 122, 94], [190, 160, 124], sp);
        },
        forest(x, y, z, lat) {
            const n = fbm(x * 2.2 + 31, y * 2.2, z * 2.2, 5), sp = fbm(x * 18, y * 18, z * 18 + 5, 3);
            const ocean = mix([24, 66, 152], [44, 104, 196], ss(70, 0, Math.abs(lat)));
            if (n < 0.53) return mix(ocean, [64, 156, 190], ss(0.48, 0.53, n) * 0.6);
            const bare = mix([168, 140, 100], [196, 170, 128], sp), green = mix([46, 112, 48], [78, 142, 62], sp);
            return mix(green, bare, ss(0.6, 0.68, n));
        },
        iceage(x, y, z, lat, lon, u, v) {
            const i = (v * TW + u) * 3, n = fbm(x * 8, y * 8, z * 8, 3); let c = [earth[i], earth[i + 1], earth[i + 2]];
            const edge = iceEdge(lon), land1 = land[v * TW + u], ln = lat + (n - 0.5) * 5;
            const ice = land1 ? ss(edge - 1.5, edge + 1.5, ln) : ss(edge + 6, edge + 10, ln) * 0.6;
            return mix(c, mix([226, 234, 242], [246, 249, 252], n), ice);
        },
        today(x, y, z, lat, lon, u, v) { const i = (v * TW + u) * 3; return [earth[i], earth[i + 1], earth[i + 2]]; },
    };
    // shading per surface: emissive, specular strength, haze colour and strength
    const LOOK = {
        sun: { emit: 1 }, proto: { spec: 0, haze: [0, 0, 0], hz: 0 }, magma: { spec: 0.1, haze: [255, 120, 40], hz: 0.5 },
        oceans: { spec: 0.35, haze: [150, 170, 185], hz: 0.35 }, life: { spec: 0.35, haze: [222, 142, 62], hz: 1 },
        oxid: { spec: 0.35, haze: [150, 190, 255], hz: 0.45 }, snow: { spec: 0.15, haze: [210, 230, 245], hz: 0.4 },
        pangaea: { spec: 0.25, haze: [150, 190, 255], hz: 0.5 }, chix: { spec: 0.3, haze: [150, 190, 255], hz: 0.5 },
        rodinia: { spec: 0.3, haze: [150, 190, 255], hz: 0.5 }, cambrian: { spec: 0.3, haze: [150, 190, 255], hz: 0.5 },
        forest: { spec: 0.3, haze: [150, 190, 255], hz: 0.5 }, iceage: { spec: 0.3, haze: [170, 200, 255], hz: 0.5 },
        today: { spec: 0.35, haze: [150, 190, 255], hz: 0.5 },
    };
    // southern edge of the ice at the Last Glacial Maximum, rough, by longitude
    const ICE = [[-180, 62], [-150, 58], [-125, 47], [-95, 39], [-75, 41], [-60, 46], [-40, 60], [-20, 60], [-8, 53], [10, 51], [30, 53], [60, 62], [120, 66], [180, 62]];
    function iceEdge(lon) { for (let i = 1; i < ICE.length; i++) if (lon <= ICE[i][0]) { const [x0, y0] = ICE[i - 1], [x1, y1] = ICE[i]; return y0 + (y1 - y0) * (lon - x0) / (x1 - x0); } return 62; }
    const tex = {};
    function texture(k) {
        if (tex[k]) return tex[k];
        if ((k === 'today' || k === 'chix' || k === 'iceage') && !earth) return failed ? texture('pangaea') : null;
        const t = new Uint8ClampedArray(TW * TH * 3), f = SURF[k];
        for (let v = 0; v < TH; v++) { const lat = 90 - (v + 0.5) / TH * 180, cl = Math.cos(lat * D), y = Math.sin(lat * D);
            for (let u = 0; u < TW; u++) { const lon = (u + 0.5) / TW * 360 - 180, c = f(cl * Math.cos(lon * D), y, cl * Math.sin(lon * D), lat, lon, u, v), i = (v * TW + u) * 3;
                t[i] = c[0]; t[i + 1] = c[1]; t[i + 2] = c[2]; } }
        return (tex[k] = t);
    }
    let failed = false;
    const im = new Image(); im.onerror = () => { failed = true; dirty = true; kick(); }; im.src = 'assets/earth.jpg';
    im.onload = () => {
        const c = document.createElement('canvas'); c.width = TW; c.height = TH; const g = c.getContext('2d');
        g.drawImage(im, 0, 0, TW, TH); const d = g.getImageData(0, 0, TW, TH).data;
        earth = new Uint8ClampedArray(TW * TH * 3); land = new Uint8Array(TW * TH);
        for (let i = 0, j = 0; i < TW * TH; i++, j += 4) { earth[i * 3] = d[j]; earth[i * 3 + 1] = d[j + 1]; earth[i * 3 + 2] = d[j + 2];
            land[i] = d[j + 2] < d[j] * 1.25 + 12 || d[j + 1] > d[j + 2] ? 1 : 0; }
        dirty = true; kick();
    };

    // ---------- drawing ----------
    function sample(t, v, lon, c) {              // bilinear
        let u = ((lon + 180) / 360 * TW - 0.5) % TW; if (u < 0) u += TW;
        const u0 = u | 0, u1 = (u0 + 1) % TW, fu = u - u0, v0 = Math.max(0, Math.min(TH - 1, Math.floor(v))), v1 = Math.min(TH - 1, v0 + 1), fv = Math.max(0, Math.min(1, v - v0));
        for (let ch = 0; ch < 3; ch++) {
            const a = t[(v0 * TW + u0) * 3 + ch], b = t[(v0 * TW + u1) * 3 + ch], e = t[(v1 * TW + u0) * 3 + ch], f = t[(v1 * TW + u1) * 3 + ch];
            c[ch] = (a + (b - a) * fu) * (1 - fv) + (e + (f - e) * fu) * fv;
        }
    }
    const cA = [0, 0, 0], cB = [0, 0, 0];
    function shade(c, k, light, sp, rim) {
        const L = LOOK[k];
        if (L.emit) { const o = Math.pow(rim, 1.6) * 0.85; c[0] = lerp(c[0], 236, o); c[1] = lerp(c[1], 112, o); c[2] = lerp(c[2], 30, o); return; }
        const s = sp * L.spec * 255, hz = Math.pow(rim, 3) * L.hz;
        for (let ch = 0; ch < 3; ch++) c[ch] = lerp(c[ch] * light + s, L.haze[ch], hz);
    }
    function render(kA, kB, m, lon0) {
        const tA = texture(kA), tB = m > 0 ? texture(kB) : null;
        out.fill(0);
        if (!tA) return false;
        for (let i = 0; i < px.length; i += 7) {
            const o = px[i], v = px[i + 1], lon = lon0 + px[i + 2];
            sample(tA, v, lon, cA); shade(cA, kA, px[i + 3], px[i + 4], px[i + 5]);
            if (tB) { sample(tB, v, lon, cB); shade(cB, kB, px[i + 3], px[i + 4], px[i + 5]);
                cA[0] = lerp(cA[0], cB[0], m); cA[1] = lerp(cA[1], cB[1], m); cA[2] = lerp(cA[2], cB[2], m); }
            out[o] = cA[0]; out[o + 1] = cA[1]; out[o + 2] = cA[2]; out[o + 3] = px[i + 6] * 255;
        }
        sctx.putImageData(img, 0, 0);
        const sunA = (kA === 'sun' ? 1 - m : 0) + (kB === 'sun' ? m : 0);
        ctx.clearRect(0, 0, S, S);
        if (sunA > 0) {
            const g = ctx.createRadialGradient(CX, CY, R * 0.9, CX, CY, S * 0.5);
            g.addColorStop(0, `rgba(255,140,50,${0.42 * sunA})`); g.addColorStop(0.35, `rgba(255,170,90,${0.12 * sunA})`); g.addColorStop(1, 'rgba(255,200,150,0)');
            ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
        }
        ctx.save(); ctx.translate(CX, CY + R * 1.2); ctx.scale(1, 0.13);
        const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.05);
        sh.addColorStop(0, 'rgba(20,20,18,.20)'); sh.addColorStop(1, 'rgba(20,20,18,0)'); ctx.fillStyle = sh;
        ctx.beginPath(); ctx.arc(0, 0, R * 1.05, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
        ctx.drawImage(sph, CX - SW / 2, CY - SW / 2);
        return true;
    }

    // ---------- caption and scrubber ----------
    const cap = fig.querySelector('.g-cap'), hEl = fig.querySelector('.g-h'), sEl = fig.querySelector('.g-s');
    const rule = fig.querySelector('.g-rule'), tickBox = fig.querySelector('.g-ticks'), thumb = fig.querySelector('.g-thumb');
    const ends = fig.querySelectorAll('.g-ends span');
    const NT = 37, ticks = [];
    for (let i = 0; i < NT; i++) { const e = document.createElement('i'); e.style.left = (i / (NT - 1) * 100) + '%'; if (i % 4 === 0) e.className = 'k'; tickBox.appendChild(e); ticks.push(e); }
    const pos = i => i / LAST;
    function caption(i) {
        const s = ST[i]; cap.textContent = s.t; hEl.textContent = s.h; sEl.textContent = s.s;
        rule.setAttribute('aria-valuenow', i); rule.setAttribute('aria-valuetext', `${s.t}: ${s.h}. ${s.s}`);
        ends[0].classList.toggle('on', i === 0); ends[1].classList.toggle('on', i === LAST);
        if (!reduced) { fig.classList.remove('swap'); void fig.offsetWidth; fig.classList.add('swap'); }
    }
    function scrub(p) {                         // p in 0..1: thumb position and the tick wave around it
        thumb.style.left = (p * 100) + '%';
        for (let i = 0; i < NT; i++) { const d = (i / (NT - 1) - p) * (NT - 1), b = Math.exp(-d * d / 6);
            ticks[i].style.height = (ticks[i].className ? 13 : 9) + 18 * b + "px"; }
    }

    // ---------- state and animation ----------
    let cur = LAST, from = LAST, m = 0, tStart = 0, lon = ST[LAST].lon, lonFrom = lon, lonTo = lon;
    let thumbP = pos(LAST), thumbFrom = thumbP, thumbT = 0, dragging = false, auto = !reduced, hold = 0, visible = true, dirty = true, raf = 0, last = 0;
    const TR = 900, HOLD = 2300, HOLD_TODAY = 3600, SPIN = 7;
    function go(i, now) {
        if (i === cur && m === 0) return;
        from = m > 0.5 ? cur : (m > 0 ? from : cur); cur = i; m = reduced ? 1 : 0; tStart = now; lonFrom = lon;
        let d = ((ST[i].lon - lon) % 360 + 360) % 360 - 360; if (d > -60) d -= 360;
        lonTo = lon + (ST[i].k === ST[from].k ? 0 : d);
        if (!dragging) { thumbFrom = thumbP; thumbT = now; }
        if (reduced) { lon = lonTo = ST[i].lon; thumbP = pos(i); scrub(thumbP); }
        caption(i); hold = 0; dirty = true; kick();
    }
    const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    function frame(now) {
        raf = 0; const dt = last ? Math.min(64, now - last) : 16; last = now;
        if (m < 1) {
            const t = reduced ? 1 : Math.min(1, (now - tStart) / TR), e = ease(t);
            m = t; lon = lerp(lonFrom, lonTo, e);
            dirty = true;
        } else if (!reduced) { lon -= SPIN * dt / 1000; dirty = true; }
        if (!dragging && thumbP !== pos(cur)) { const tt = reduced ? 1 : Math.min(1, (now - thumbT) / TR); thumbP = tt >= 1 ? pos(cur) : lerp(thumbFrom, pos(cur), ease(tt)); scrub(thumbP); }
        if (auto && m >= 1 && !dragging) { hold += dt; if (hold > (cur === LAST ? HOLD_TODAY : HOLD)) go((cur + 1) % N, now); }
        if (dirty) { const ok = m >= 1 ? render(ST[cur].k, ST[cur].k, 0, lon) : render(ST[from].k, ST[cur].k, m, lon); dirty = false; }
        if (visible && !document.hidden && (!reduced || m < 1)) raf = requestAnimationFrame(frame); else last = 0;
    }
    function kick() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }

    // ---------- input ----------
    rule.removeAttribute('aria-hidden'); rule.setAttribute('role', 'slider'); rule.tabIndex = 0; rule.setAttribute('aria-label', 'Time');
    rule.setAttribute('aria-valuemin', 0); rule.setAttribute('aria-valuemax', LAST);
    const at = e => { const b = rule.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)); };
    rule.addEventListener('pointerdown', e => { if (e.button) return; dragging = true; auto = false; rule.setPointerCapture(e.pointerId); move(e); });
    rule.addEventListener('pointermove', e => { if (dragging) move(e); });
    const up = () => { if (!dragging) return; dragging = false; thumbFrom = thumbP; thumbT = performance.now(); kick(); };
    rule.addEventListener('pointerup', up); rule.addEventListener('pointercancel', up); rule.addEventListener('lostpointercapture', up);
    function move(e) { thumbP = at(e); scrub(thumbP); const i = Math.round(thumbP * LAST); if (i !== cur) go(i, performance.now()); }
    rule.addEventListener('keydown', e => {
        const k = e.key, i = k === 'ArrowRight' || k === 'ArrowUp' ? cur + 1 : k === 'ArrowLeft' || k === 'ArrowDown' ? cur - 1 : k === 'Home' ? 0 : k === 'End' ? LAST : null;
        if (i === null) return; e.preventDefault(); auto = false; go(Math.max(0, Math.min(LAST, i)), performance.now());
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(cv);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

    caption(cur); scrub(thumbP); kick();
    // build the other surfaces in idle time so the first transitions do not stall
    const idle = window.requestIdleCallback || (f => setTimeout(f, 200));
    let q = ST.map(s => s.k); const warm = () => { const k = q.shift(); if (!k) return; if (!texture(k) && !failed && (k === 'today' || k === 'chix' || k === 'iceage')) q.push(k); if (q.length) idle(warm); };
    idle(warm);
})();

/* A dotted globe of real land (Natural Earth), centred on West Africa, with the five study sites
   and one satellite on a polar orbit. Canvas, no libraries. Drag to turn. Static when reduced motion. */
(() => {
    const cv = document.querySelector('.globe canvas'); if (!cv || !window.GLOBE) return;
    const ctx = cv.getContext('2d'), D = Math.PI / 180, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const P = window.GLOBE, N = P.length / 2;
    const SITES = [[5.6, 12.4, '#1f5fae'], [6.7, 7.0, '#1f5fae'], [3.6, 7.7, '#0f766e'], [2.2, 9.6, '#a8661b'], [16.5, 12.0, '#5b6b7a'], [3.4, 6.55, '#b3361b']];
    let W, H, R, cx, cy, lam = 10, phi0 = 8, drag = null, extra = 0, visible = true, t0 = performance.now();
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(r.width * d); H = cv.height = Math.round(r.height * d); R = Math.min(W, H) * .46; cx = W / 2; cy = H / 2; };
    const proj = (lon, lat, l0) => {
        const f = lat * D, l = (lon - l0) * D, f0 = phi0 * D, cf = Math.cos(f);
        const c = Math.sin(f0) * Math.sin(f) + Math.cos(f0) * cf * Math.cos(l);
        return [cx + R * cf * Math.sin(l), cy - R * (Math.cos(f0) * Math.sin(f) - Math.sin(f0) * cf * Math.cos(l)), c];
    };
    // satellite on a 98° inclined orbit; position from time
    const sat = (u, node) => { const i = 98 * D, lat = Math.asin(Math.sin(i) * Math.sin(u)) / D, lon = node + Math.atan2(Math.cos(i) * Math.sin(u), Math.cos(u)) / D; return [lon, lat]; };
    function frame(now) {
        const t = (now - t0) / 1000;
        const l0 = lam + (reduced ? 0 : Math.sin(t * .12) * 28) + extra;
        ctx.clearRect(0, 0, W, H);
        // sphere and rim
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = '#f5f5f3'; ctx.fill();
        ctx.lineWidth = Math.max(1, W / 600); ctx.strokeStyle = '#c9c6bd'; ctx.stroke();
        // graticule every 30°
        ctx.fillStyle = '#c9c6bd';
        for (let lo = -180; lo < 180; lo += 30) for (let la = -80; la <= 80; la += 2.5) { const [x, y, c] = proj(lo, la, l0); if (c > 0) ctx.fillRect(x, y, W / 900, W / 900); }
        for (let la = -60; la <= 60; la += 30) for (let lo = -180; lo < 180; lo += 2.5) { const [x, y, c] = proj(lo, la, l0); if (c > 0) ctx.fillRect(x, y, W / 900, W / 900); }
        // land dots, darker toward the centre of the disc
        const dr = Math.max(1.1, W / 330);
        for (let k = 0; k < N; k++) { const [x, y, c] = proj(P[2 * k], P[2 * k + 1], l0); if (c <= 0) continue; ctx.globalAlpha = .25 + .65 * c; ctx.fillStyle = '#55544e'; ctx.fillRect(x - dr / 2, y - dr / 2, dr, dr); }
        ctx.globalAlpha = 1;
        // satellite: trail then body
        const node = 30 - t * 4, sp = .35;
        for (let j = 60; j >= 0; j--) { const [lo, la] = sat(t * sp - j * .02, node), [x, y, c] = proj(lo, la, l0); if (c <= 0) continue; ctx.globalAlpha = (1 - j / 60) * .6; ctx.fillStyle = '#1f5fae'; ctx.beginPath(); ctx.arc(x, y, dr * .6, 0, 7); ctx.fill(); }
        ctx.globalAlpha = 1; { const [lo, la] = sat(t * sp, node), [x, y, c] = proj(lo, la, l0); if (c > 0) { ctx.fillStyle = '#141412'; ctx.fillRect(x - dr * 1.6, y - dr * .6, dr * 3.2, dr * 1.2); ctx.fillStyle = '#1f5fae'; ctx.fillRect(x - dr * .7, y - dr * .7, dr * 1.4, dr * 1.4); } }
        // study sites: a dot and a slow pulse
        SITES.forEach(([lo, la, col], i) => { const [x, y, c] = proj(lo, la, l0); if (c <= 0) return; const ph = ((t * .6 + i * .17) % 1);
            ctx.globalAlpha = reduced ? 0 : (1 - ph) * .6; ctx.strokeStyle = col; ctx.lineWidth = W / 500; ctx.beginPath(); ctx.arc(x, y, dr * (2.5 + ph * 9), 0, 7); ctx.stroke();
            ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, dr * 2.3, 0, 7); ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = W / 700; ctx.stroke(); });
        if (!reduced && visible) requestAnimationFrame(frame);
    }
    size(); addEventListener('resize', () => { size(); if (reduced) frame(performance.now()); });
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); drag = { x: e.clientX, base: extra }; });
    cv.addEventListener('pointermove', e => { if (!drag) return; extra = drag.base - (e.clientX - drag.x) * .4; if (reduced) frame(performance.now()); });
    const end = () => { drag = null; }; cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    if ('IntersectionObserver' in window && !reduced) new IntersectionObserver(es => es.forEach(e => { const was = visible; visible = e.isIntersecting; if (visible && !was) requestAnimationFrame(frame); })).observe(cv);
    requestAnimationFrame(frame);
})();

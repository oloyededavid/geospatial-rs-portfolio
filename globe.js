/* The hero: a photographic Earth (Esri World Imagery, reprojected) that turns to each study in time order,
   with a timeline beneath it. Canvas only, no libraries. Static at the first moment for reduced motion. */
(() => {
    const fig = document.querySelector('.globe'), cv = fig && fig.querySelector('canvas'); if (!cv) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, D = Math.PI / 180;
    const M = [
        { y: 1985, lon: 5.6, lat: 12.4, t: '1985', h: 'Rainfall records begin', s: 'Sokoto–Rima basin, Nigeria' },
        { y: 2002, lon: 16.5, lat: 12.0, t: '2002', h: 'Gravity satellites start weighing water', s: 'Lake Chad basin' },
        { y: 2018, lon: 2.2, lat: 9.6, t: '2018', h: 'A satellite water balance', s: 'Upper Ouémé, Benin' },
        { y: 2019, lon: 3.6, lat: 7.7, t: '2019', h: 'A river followed month by month', s: 'Ogun River, Nigeria' },
        { y: 2022, lon: 3.4, lat: 6.55, t: '2020–2024', h: 'Heat measured from space', s: 'Lagos State, Nigeria' },
        { y: 2070, lon: 6.7, lat: 7.0, t: '2041–2070', h: 'Extreme rainfall, projected', s: 'Lower Niger–Benue, Nigeria' },
    ];
    const Y0 = 1980, Y1 = 2075, S = 360;          // internal render size; CSS scales it
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(S, S), out = img.data;
    const cap = fig.querySelector('.g-cap'), h = fig.querySelector('.g-h'), sub = fig.querySelector('.g-s'), ticks = fig.querySelector('.g-ticks'), thumb = fig.querySelector('.g-thumb');
    // ticks: one per two years, tall at each study
    for (let y = Y0; y <= Y1; y += 2) { const i = document.createElement('i'); i.style.left = ((y - Y0) / (Y1 - Y0) * 100) + '%'; ticks.append(i); }
    M.forEach(m => { const i = document.createElement('i'); i.className = 'k'; i.style.left = ((m.y - Y0) / (Y1 - Y0) * 100) + '%'; ticks.append(i); });
    const tex = new Image(); tex.src = 'assets/earth.jpg';
    let T, TW, TH, lon = M[0].lon, lat = M[0].lat, k = 0, tLon = lon, tLat = lat, spin = 0;
    tex.onload = () => {
        const c = document.createElement('canvas'); TW = c.width = tex.width; TH = c.height = tex.height;
        const x = c.getContext('2d'); x.drawImage(tex, 0, 0); T = x.getImageData(0, 0, TW, TH).data;
        show(0); requestAnimationFrame(loop); if (!reduced) setInterval(() => show((k + 1) % M.length), 3800);
    };
    function show(i) {
        k = i; const m = M[i]; tLon = m.lon; tLat = Math.max(-20, Math.min(25, m.lat));
        cap.textContent = m.t; h.textContent = m.h; sub.textContent = m.s;
        thumb.style.left = ((m.y - Y0) / (Y1 - Y0) * 100) + '%';
        fig.classList.remove('swap'); void fig.offsetWidth; fig.classList.add('swap');
    }
    const R = S / 2 - 2, c0 = S / 2;
    function render(now) {
        const l0 = lon * D, f0 = lat * D, sf = Math.sin(f0), cf = Math.cos(f0);
        const ring = M[k], pulse = (now / 1200) % 1;
        for (let py = 0; py < S; py++) {
            const yN = (c0 - py) / R;
            for (let px = 0; px < S; px++) {
                const o = (py * S + px) * 4, xN = (px - c0) / R, rr = xN * xN + yN * yN;
                if (rr > 1) { out[o + 3] = 0; continue; }
                const z = Math.sqrt(1 - rr);
                const la = Math.asin(yN * cf + z * sf), lo = l0 + Math.atan2(xN, z * cf - yN * sf);
                let u = ((lo / (2 * Math.PI) + .5) % 1 + 1) % 1, v = .5 - la / Math.PI;
                const ti = ((v * TH | 0) * TW + (u * TW | 0)) * 4;
                const sh = .35 + .65 * Math.pow(z, .55);            // soft limb darkening
                out[o] = T[ti] * sh; out[o + 1] = T[ti + 1] * sh; out[o + 2] = T[ti + 2] * sh; out[o + 3] = 255;
            }
        }
        ctx.putImageData(img, 0, 0);
        // atmosphere rim
        const g = ctx.createRadialGradient(c0, c0, R * .86, c0, c0, R); g.addColorStop(0, 'rgba(120,170,255,0)'); g.addColorStop(1, 'rgba(150,195,255,.45)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c0, c0, R, 0, 7); ctx.fill();
        // study site: dot and pulse
        const la = ring.lat * D, lo = (ring.lon - lon) * D, cz = Math.sin(f0) * Math.sin(la) + Math.cos(f0) * Math.cos(la) * Math.cos(lo);
        if (cz > 0) {
            const x = c0 + R * Math.cos(la) * Math.sin(lo), y = c0 - R * (Math.cos(f0) * Math.sin(la) - Math.sin(f0) * Math.cos(la) * Math.cos(lo));
            if (!reduced) { ctx.strokeStyle = `rgba(255,255,255,${(1 - pulse) * .9})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 4 + pulse * 16, 0, 7); ctx.stroke(); }
            ctx.fillStyle = '#ffb35c'; ctx.beginPath(); ctx.arc(x, y, 3.6, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.stroke();
        }
    }
    let visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(cv);
    function loop(now) {
        if (visible) {
            spin = reduced ? 0 : Math.sin(now / 6000) * 6;
            lon += (tLon + spin - lon) * .05; lat += (tLat - lat) * .05;
            render(now);
        }
        if (!reduced) requestAnimationFrame(loop); else render(0);
    }
})();

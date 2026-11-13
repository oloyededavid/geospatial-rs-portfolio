/* Lagos explorer on the portfolio, as a short self-playing tour: a cursor switches layers and opens areas on the
   real explorer data. Not interactive here; the whole figure links to the study. Leaflet loads only near the screen. */
(() => {
    const fig = document.querySelector('.lx'); if (!fig) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const css = h => new Promise(r => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = h; l.onload = r; document.head.append(l); });
    const js = s => new Promise((r, x) => { const e = document.createElement('script'); e.src = s; e.onload = r; e.onerror = x; document.head.append(e); });
    const HEAT = ['#fde8d3', '#f8b77a', '#ec7b37', '#c2470f', '#6b2406'], GREEN = ['#eef5e6', '#bfdcaa', '#7fb86a', '#3f8a3a', '#14532d'], PURP = ['#f1ecf7', '#cdbde3', '#9e86c8', '#6c4fa6', '#3d2470'], DIV = ['#2f6fd6', '#a9c4ee', '#f4f4f2', '#f1a37a', '#c2410c'];
    const L_ = [
        { k: 'lst', tab: 'Temperature', title: 'Land surface temperature (°C)', sub: 'Landsat, dry-season median', pal: HEAT, fmt: v => v.toFixed(1), unit: ' °C' },
        { k: 'z', tab: 'Hot & cold spots', title: 'Hot and cold spots (Gi* z)', sub: 'Five nearest neighbours; none significant after correction', pal: DIV, fmt: v => (v > 0 ? '+' : '') + v.toFixed(2), unit: '', div: true },
        { k: 'hpi', tab: 'Heat × population', title: 'Heat × population index (0–1)', sub: 'Surface temperature × population density, each scaled 0–1', pal: HEAT, fmt: v => v.toFixed(2), unit: '' },
        { k: 'ndvi', tab: 'Vegetation', title: 'Vegetation (NDVI)', sub: 'Dry-season median', pal: GREEN, fmt: v => v.toFixed(2), unit: '' },
        { k: 'dens', tab: 'Population', title: 'Population density (people per km²)', sub: 'WorldPop 2020, a modelled estimate', pal: PURP, fmt: v => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(v), unit: '' },
    ];
    const col = (pal, t) => { t = Math.max(0, Math.min(1, t)); const x = t * (pal.length - 1), i = Math.min(pal.length - 2, Math.floor(x)), f = x - i, h = c => [1, 3, 5].map(j => parseInt(c.slice(j, j + 2), 16)), a = h(pal[i]), b = h(pal[i + 1]); return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * f)).join(',')})`; };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    async function boot() {
        await Promise.all([css('assets/vendor/leaflet-1.9.4/leaflet.css'), js('assets/vendor/leaflet-1.9.4/leaflet.js')]);
        const G = await (await fetch('assets/lagos-lga.json')).json();
        const box = fig.querySelector('.lx-map');
        const map = L.map(box, { zoomControl: false, attributionControl: true, dragging: false, scrollWheelZoom: false, touchZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, zoomSnap: 1, fadeAnimation: false });
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 13, attribution: 'Basemap © Esri' }).addTo(map);
        map.attributionControl.setPrefix(false);
        const layer = L.geoJSON(G, { style: () => ({ color: '#fff', weight: 1, fillOpacity: .9 }), interactive: false }).addTo(map);
        const fit = () => map.fitBounds(layer.getBounds(), { paddingTopLeft: [10, 60], paddingBottomRight: [10, 10] }); fit();
        const feats = []; layer.eachLayer(l => feats.push(l));
        let cur = 2, sel = null, labels = [], tip = null;
        const range = m => { const v = feats.map(l => l.feature.properties[m.k]); return m.div ? (() => { const a = Math.max(...v.map(Math.abs)); return [-a, a]; })() : [Math.min(...v), Math.max(...v)]; };
        const tabs = fig.querySelector('.lx-tabs');
        const tb = L_.map(m => { const b = document.createElement('span'); b.className = 'lx-tab'; b.textContent = m.tab; tabs.append(b); return b; });
        const BIG = ['Alimosho', 'Ikorodu', 'Epe', 'Ibeju Lekki', 'Badagry', 'Eti-Osa', 'Ojo'];
        const rank = (k, n) => 1 + feats.filter(l => l.feature.properties[k] > n).length;
        function paint(i) {
            cur = i; const m = L_[i], [a, z] = range(m);
            feats.forEach(l => { const v = l.feature.properties[m.k]; l.setStyle({ fillColor: col(m.pal, (v - a) / (z - a || 1)), color: l === sel ? '#3a3a37' : '#fff', weight: l === sel ? 2.4 : 1 }); });
            tb.forEach((b, j) => b.classList.toggle('on', j === i));
            labels.forEach(x => x.remove()); labels = feats.filter(l => BIG.includes(l.feature.properties.n)).map(l => L.marker(l.getBounds().getCenter(), { interactive: false, keyboard: false, icon: L.divIcon({ className: 'lx-lab', html: `<b>${l.feature.properties.n}</b> ${m.fmt(l.feature.properties[m.k])}`, iconSize: null }) }).addTo(map));
            fig.querySelector('.lx-lt').textContent = m.title;
            fig.querySelector('.lx-ramp').style.background = `linear-gradient(90deg, ${m.pal.join(',')})`;
            fig.querySelector('.lx-lo').textContent = m.fmt(a); fig.querySelector('.lx-mid').textContent = m.fmt((a + z) / 2); fig.querySelector('.lx-hi').textContent = m.fmt(z);
            panel();
        }
        function panel() {
            const l = sel || feats.reduce((a, c) => c.feature.properties.hpi > a.feature.properties.hpi ? c : a), p = l.feature.properties;
            fig.querySelector('.lx-sel').textContent = p.n;
            fig.querySelector('.lx-name').textContent = p.n;
            fig.querySelector('.lx-sub').textContent = `${p.area.toLocaleString('en-GB')} km² of land · ${p.pop.toLocaleString('en-GB')} people (WorldPop 2020)`;
            const card = (t, v, u, s, on) => `<div class="lx-c${on ? ' on' : ''}"><p>${t}</p><b>${v}<small>${u}</small></b><span>${s}</span></div>`;
            fig.querySelector('.lx-cards').innerHTML =
                card('Surface temperature', p.lst.toFixed(1), ' °C', `${rank('lst', p.lst)} of 20 · MODIS ${p.modis.toFixed(1)} °C`, cur === 0) +
                card('Heat × population', p.hpi.toFixed(2), '', `${rank('hpi', p.hpi)} of 20`, cur === 2) +
                card('Hot / cold spot', (p.z > 0 ? '+' : '−') + Math.abs(p.z).toFixed(2), ' z', p.cat, cur === 1) +
                card('Population density', p.dens.toLocaleString('en-GB'), '', 'people per km² of land', cur === 4) +
                card('Vegetation', p.ndvi.toFixed(2), '', 'NDVI, dry-season median', cur === 3) +
                card('Elevation', p.elev, ' m', `mean slope ${p.slope}°`, false);
        }
        paint(2);
        fig.classList.add('ready'); setTimeout(() => { map.invalidateSize(); fit(); }, 60);
        new ResizeObserver(() => { map.invalidateSize(); fit(); }).observe(box);
        if (reduced) return;
        // the tour: a cursor moves to a layer tab, switches it, then opens two areas; then the next layer
        const cur_ = fig.querySelector('.lx-cursor');
        const at = (x, y) => { cur_.style.transform = `translate(${x}px, ${y}px)`; };
        const rel = el => { const r = el.getBoundingClientRect(), f = fig.getBoundingClientRect(); return [r.left - f.left + r.width * .5, r.top - f.top + r.height * .6]; };
        const click = async () => { cur_.classList.add('down'); await wait(160); cur_.classList.remove('down'); };
        const hover = l => { if (tip) tip.remove(); const m = L_[cur], c = l.getBounds().getCenter(); tip = L.tooltip({ className: 'lx-tip', direction: 'top', offset: [0, -10] }).setLatLng(c).setContent(`<b>${l.feature.properties.n}</b><br>${m.title.replace(/ \(.*/, '')}: ${m.fmt(l.feature.properties[m.k])}${m.unit}`).addTo(map); };
        const pt = l => { const p = map.latLngToContainerPoint(l.getBounds().getCenter()), b = box.getBoundingClientRect(), f = fig.getBoundingClientRect(); return [p.x + b.left - f.left, p.y + b.top - f.top]; };
        const byName = n => feats.find(l => l.feature.properties.n === n);
        const PLAN = [[0, ['Agege', 'Epe']], [1, ['Ikeja', 'Ibeju Lekki']], [2, ['Ajeromi/Ifelodun', 'Alimosho']], [3, ['Mushin', 'Epe']], [4, ['Lagos Island', 'Ikorodu']]];
        let running = false, visible = false;
        const sleepUntilVisible = async () => { while (!visible) await wait(400); };
        const tour = async () => {
            if (running) return; running = true; fig.classList.add('touring');
            const r0 = fig.getBoundingClientRect(); at(r0.width * .55, r0.height * .7);
            for (;;) {
                for (const [i, names] of PLAN) {
                    await sleepUntilVisible();
                    const [x, y] = rel(tb[i]); at(x, y); await wait(900); await click(); sel = null; if (tip) { tip.remove(); tip = null; } paint(i); await wait(900);
                    for (const n of names) { const l = byName(n); if (!l) continue; const [px, py] = pt(l); at(px, py); await wait(1000); hover(l); await wait(500); await click(); sel = l; paint(i); await wait(1500); }
                }
            }
        };
        new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible) tour(); }), { threshold: .3 }).observe(fig);
    }
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); boot(); } }, { rootMargin: '600px 0px' }); io.observe(fig); } else boot();
})();

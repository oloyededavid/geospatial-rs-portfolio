/* Lagos explorer on the portfolio: twenty local government areas on the grey basemap, five layers,
   labels with values, and a panel for one area. Loads Leaflet only when the section comes near the screen. */
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
    async function boot() {
        await Promise.all([css('assets/vendor/leaflet-1.9.4/leaflet.css'), js('assets/vendor/leaflet-1.9.4/leaflet.js')]);
        const G = await (await fetch('assets/lagos-lga.json')).json();
        const box = fig.querySelector('.lx-map');
        const map = L.map(box, { zoomControl: false, attributionControl: true, scrollWheelZoom: false, zoomSnap: .25 });
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 13, attribution: 'Basemap © Esri' }).addTo(map);
        map.attributionControl.setPrefix(false); L.control.zoom({ position: 'topright' }).addTo(map);
        let cur = 0, sel = null, auto = !reduced, timer = null, labels = [];
        const layer = L.geoJSON(G, { style: () => ({ color: '#fff', weight: 1, fillOpacity: .9 }) }).addTo(map);
        const fit = () => map.fitBounds(layer.getBounds(), { paddingTopLeft: [20, 70], paddingBottomRight: [20, 20] }); fit();
        const feats = []; layer.eachLayer(l => feats.push(l));
        const range = m => { const v = feats.map(l => l.feature.properties[m.k]); return m.div ? (() => { const a = Math.max(...v.map(Math.abs)); return [-a, a]; })() : [Math.min(...v), Math.max(...v)]; };
        const tabs = fig.querySelector('.lx-tabs');
        const tb = L_.map((m, i) => { const b = document.createElement('button'); b.type = 'button'; b.role = 'tab'; b.textContent = m.tab; b.addEventListener('click', () => { stop(); paint(i); }); tabs.append(b); return b; });
        L.DomEvent.disableClickPropagation(tabs);
        const BIG = ['Alimosho', 'Ikorodu', 'Epe', 'Ibeju Lekki', 'Badagry', 'Eti-Osa', 'Ojo'];
        function paint(i) {
            cur = i; const m = L_[i], [a, z] = range(m);
            feats.forEach(l => { const v = l.feature.properties[m.k]; l.setStyle({ fillColor: col(m.pal, (v - a) / (z - a || 1)), color: l === sel ? '#141412' : '#fff', weight: l === sel ? 2.4 : 1 }); });
            tb.forEach((b, j) => { b.setAttribute('aria-selected', j === i); b.classList.toggle('auto', j === i && auto); if (j === i && auto) { b.classList.remove('auto'); void b.offsetWidth; b.classList.add('auto'); } });
            labels.forEach(x => x.remove()); labels = feats.filter(l => BIG.includes(l.feature.properties.n) || l === sel).map(l => L.marker(l.getBounds().getCenter(), { interactive: false, keyboard: false, icon: L.divIcon({ className: 'lx-lab', html: `<b>${l.feature.properties.n}</b> ${m.fmt(l.feature.properties[m.k])}`, iconSize: null }) }).addTo(map));
            fig.querySelector('.lx-lt').textContent = m.title;
            fig.querySelector('.lx-ramp').style.background = `linear-gradient(90deg, ${m.pal.join(',')})`;
            fig.querySelector('.lx-lo').textContent = m.fmt(a); fig.querySelector('.lx-mid').textContent = m.fmt((a + z) / 2); fig.querySelector('.lx-hi').textContent = m.fmt(z);
            panel();
        }
        const rank = (k, n) => 1 + feats.filter(l => l.feature.properties[k] > n).length;
        function panel() {
            const l = sel || feats.reduce((a, c) => c.feature.properties.hpi > a.feature.properties.hpi ? c : a), p = l.feature.properties;
            fig.querySelector('.lx-sel').value = p.n;
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
        const selEl = fig.querySelector('.lx-sel');
        feats.slice().sort((a, b) => a.feature.properties.n.localeCompare(b.feature.properties.n)).forEach(l => selEl.append(new Option(l.feature.properties.n, l.feature.properties.n)));
        selEl.addEventListener('change', () => { stop(); sel = feats.find(l => l.feature.properties.n === selEl.value); paint(cur); });
        feats.forEach(l => {
            l.on('mouseover', () => { l.setStyle({ weight: 2.4, color: '#141412' }); l.bindTooltip(`<b>${l.feature.properties.n}</b><br>${L_[cur].title.replace(/ \(.*/, '')}: ${L_[cur].fmt(l.feature.properties[L_[cur].k])}${L_[cur].unit}`, { sticky: true, className: 'lx-tip' }).openTooltip(); });
            l.on('mouseout', () => { if (l !== sel) l.setStyle({ weight: 1, color: '#fff' }); });
            l.on('click', () => { stop(); sel = l; paint(cur); });
        });
        const stop = () => { auto = false; clearInterval(timer); timer = null; tb.forEach(b => b.classList.remove('auto')); };
        paint(2);
        fig.classList.add('ready'); setTimeout(() => { map.invalidateSize(); fit(); }, 60);
        new ResizeObserver(() => { map.invalidateSize(); }).observe(box);
        if (auto) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && auto && !timer) timer = setInterval(() => paint((cur + 1) % L_.length), 3600); else if (!e.isIntersecting) { clearInterval(timer); timer = null; } }), { threshold: .3 }); io.observe(fig); }
        fig.addEventListener('pointerdown', stop, { once: true });
    }
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); boot(); } }, { rootMargin: '600px 0px' }); io.observe(fig); } else boot();
})();

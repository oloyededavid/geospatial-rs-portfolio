/* Small enhancements only. The page works without it:
   reveal on scroll, a sticky header that marks the current section, footprints drawing in, and the legend linked to the map. */
(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = [...document.querySelectorAll('.reveal')];
    if (reduced || !('IntersectionObserver' in window)) items.forEach(el => el.classList.add('in'));
    else {
        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        items.forEach(el => io.observe(el));
    }

    // header: a rule once the page scrolls; mark the section in view
    const head = document.querySelector('.collar-top');
    const onScroll = () => head && head.classList.toggle('scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    if ('IntersectionObserver' in window) {
        const links = [...document.querySelectorAll('.site-nav a[href^="#"]')];
        const live = new Set();
        const mark = () => { const id = [...live].pop(); links.forEach(a => { if (id && a.hash === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); };
        const so = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? live.add(e.target.id) : live.delete(e.target.id)); mark(); }, { rootMargin: '-45% 0px -50% 0px' });
        links.forEach(a => { const t = document.querySelector(a.hash); t && so.observe(t); });
    }


    // ---------- life ----------
    // headline words rise in one by one
    const h1 = document.querySelector('.hello h1');
    if (h1 && !reduced) {
        const words = h1.textContent.trim().split(/\s+/);
        h1.setAttribute('aria-label', h1.textContent.trim());
        h1.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
    }
    // scroll progress
    const bar = document.querySelector('.progress');
    const prog = () => { const h = document.documentElement.scrollHeight - innerHeight; bar && bar.style.setProperty('--p', h > 0 ? scrollY / h : 0); };
    addEventListener('scroll', prog, { passive: true }); prog();
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    // hero light follows the cursor
    const hello = document.querySelector('.hello'), bg = document.querySelector('.hello-bg');
    if (hello && bg && fine && !reduced) hello.addEventListener('pointermove', e => { const r = hello.getBoundingClientRect(); bg.style.setProperty('--mx', (e.clientX - r.left) + 'px'); bg.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    // buttons lean toward the cursor
    if (fine && !reduced) document.querySelectorAll('.cta').forEach(b => {
        const host = b.closest('.hello-actions') ? b : null; if (!host) return;
        b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`; });
        b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    // reveal: section rules and the legend
    if ('IntersectionObserver' in window && !reduced) {
        const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }), { threshold: .2 });
        document.querySelectorAll('.sec-head, .legend').forEach(el => ro.observe(el));
    } else document.querySelectorAll('.sec-head, .legend').forEach(el => el.classList.add('in'));



    // card tags stay on one line: drop whole tags that do not fit rather than cutting them
    const fitTags = () => document.querySelectorAll('.inset .tags').forEach(ul => {
        const li = [...ul.children]; li.forEach(x => x.classList.remove('off'));
        const r = ul.getBoundingClientRect().right; li.forEach(x => { if (x.getBoundingClientRect().right > r + 1) x.classList.add('off'); });
    });
    fitTags(); document.fonts && document.fonts.ready.then(fitTags); addEventListener('resize', () => requestAnimationFrame(fitTags));
    // About: the paragraph darkens word by word as it scrolls through the screen
    const abPs = [...document.querySelectorAll('.ab-text > p:not(.ab-lead)')], abP = abPs[0] && abPs[0].parentElement;
    if (abP && !reduced) {
        const walk = n => { [...n.childNodes].forEach(c => {
            if (c.nodeType === 3 && c.textContent.trim()) {
                const f = document.createDocumentFragment();
                c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const s = document.createElement('span'); s.className = 'rw'; s.textContent = w; f.append(s); } });
                c.replaceWith(f);
            } else if (c.nodeType === 1 && c.tagName !== 'svg') walk(c);
        }); };
        abPs.forEach(walk);
        const words = [...abP.querySelectorAll('.rw')];
        let lastK = -1;
        const read = () => {
            const r0 = abPs[0].getBoundingClientRect(), r1 = abPs[abPs.length - 1].getBoundingClientRect(), r = { top: r0.top, height: r1.bottom - r0.top }, vh = innerHeight;
            const p = Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.15)));
            const k = Math.round(p * words.length);
            if (k === lastK) return; lastK = k;
            words.forEach((w, i) => w.classList.toggle('on', i < k));
        };
        addEventListener('scroll', () => requestAnimationFrame(read), { passive: true }); addEventListener('resize', read); read();
    }
    // language switcher: remember the choice and keep the current section
    document.querySelectorAll('.lang a[data-lang]').forEach(a => a.addEventListener('click', () => {
        try { localStorage.setItem('lang', a.dataset.lang); } catch (e) {}
        // keep the reader's place: the hash if there is one, otherwise the section now on screen
        let h = location.hash;
        if (!h) { const ids = ['top', 'map', 'studies', 'about', 'skills']; let best = null;
            ids.forEach(id => { const e = document.getElementById(id); if (e && e.getBoundingClientRect().top <= innerHeight * .35) best = id; });
            h = best && best !== 'top' ? '#' + best : ''; }
        a.href = a.href.split('#')[0] + h;
    }));
    // about: copy the email address, and say so
    document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
        const label = b.querySelector('span'); if (!label) return; const was = b.dataset.label || (b.dataset.label = label.textContent); clearTimeout(b._t);
        try { await navigator.clipboard.writeText(b.dataset.copy); label.textContent = (window.I18N && window.I18N['Copied']) || 'Copied'; }
        catch (e) { location.href = 'mailto:' + b.dataset.copy; return; }
        b._t = setTimeout(() => { label.textContent = was; }, 1800);
    }));
    // projects: search (ranked, typo-tolerant, never empty) and grid/list view
    const list = document.querySelector('#studies .inset-list'), q = document.getElementById('pf-q'), st = document.getElementById('pf-status');
    if (list && q) {
        const T = k => (window.I18N && window.I18N[k]) || k;
        const norm = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
        const cards = [...list.querySelectorAll('.inset')];
        const docs = cards.map((c, i) => {
            const words = new Set(norm(c.textContent + ' ' + (c.dataset.k || '')).split(' ').filter(w => w.length > 1));
            return { c, i, words: [...words], page: [], text: ' ' + [...words].join(' ') + ' ' };
        });
        // full text of each study page (assets/search-index.json, built by tools/build_search.py)
        fetch((window.SITE_ROOT || '') + 'assets/search-index.json').then(r => r.ok ? r.json() : {}).then(ix => {
            docs.forEach(d => { const w = ix[d.c.dataset.n]; if (w) d.page = w.split(' '); });
            if (q.value.trim()) run();
        }).catch(() => {});
        const lev = (a, b) => {   // edit distance, stopped early when it cannot be small
            if (Math.abs(a.length - b.length) > 2) return 9;
            let p = Array.from({ length: b.length + 1 }, (_, j) => j);
            for (let i = 1; i <= a.length; i++) {
                const r = [i];
                for (let j = 1; j <= b.length; j++) r[j] = Math.min(p[j] + 1, r[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
                p = r;
            }
            return p[b.length];
        };
        const grams = w => { const g = new Set(), s = `  ${w} `; for (let i = 0; i < s.length - 2; i++) g.add(s.slice(i, i + 3)); return g; };
        const sim = (a, b) => { const A = grams(a), B = grams(b); let n = 0; A.forEach(g => B.has(g) && n++); return 2 * n / (A.size + B.size); };
        const fit = (ws, t) => {
            let b = 0;
            for (const w of ws) {
                if (w === t) return 3;
                if (w.startsWith(t)) b = Math.max(b, 2.2);
                else if (t.length > 3 && w.includes(t)) b = Math.max(b, 1.6);
                else if (t.length > 4) { const e = lev(t, w); if (e <= (t.length > 8 ? 2 : 1)) b = Math.max(b, 1.4 - e * .2); }
            }
            return b;
        };
        // the card counts fully; a word found only in the study's own page counts a little less
        const best = (d, t) => {
            let b = Math.max(fit(d.words, t), .7 * fit(d.page, t));
            if (b && d.text.includes(' ' + toks_all + ' ')) b += .5;
            return b;
        };
        // every word must match when some project matches them all; otherwise the best partial matches
        const score = (d, toks) => { const b = toks.map(t => best(d, t)); return { s: b.reduce((a, x) => a + x, 0), all: b.every(x => x > 0) }; };
        let toks_all = '';
        const near = (d, toks) => toks.reduce((s, t) => s + Math.max(0, ...d.words.map(w => sim(t, w)), ...d.page.map(w => .8 * sim(t, w))), 0);
        const show = order => { cards.forEach(c => c.classList.add('pf-hide')); order.forEach(d => { d.c.classList.remove('pf-hide'); d.c.classList.add('in'); list.appendChild(d.c); }); };
        const reset = () => { docs.forEach(d => { d.c.classList.remove('pf-hide'); list.appendChild(d.c); }); st.textContent = ''; };
        const run = () => {
            const raw = q.value.trim(), toks = norm(raw).split(' ').filter(Boolean);
            if (!toks.length || raw.length < 2) return reset();
            toks_all = toks.join(' ');
            let hits = docs.map(d => ({ ...d, ...score(d, toks) })).filter(d => d.s > 0);
            if (hits.some(d => d.all)) hits = hits.filter(d => d.all);
            hits.sort((a, b) => b.s - a.s || a.i - b.i);
            // a hit counts as a match only if some word matched exactly or by its start; spelling tolerance alone gives "closest"
            const strong = hits.filter(d => d.s >= 1.5 * toks.length * .7);
            if (strong.length) {
                show(strong);
                st.textContent = strong.length === 1 ? T('1 project matches') : T('{n} projects match').replace('{n}', strong.length);
            } else if (hits.length) {
                show(hits.slice(0, 3));
                st.textContent = T('No exact match. The closest projects:');
            } else {
                const closest = docs.map(d => ({ ...d, s: near(d, toks) })).sort((a, b) => b.s - a.s || a.i - b.i).slice(0, 3);
                // spelling tolerance only counts when it is close; below this, nothing is related, so say so and show all
                if (!closest.length || closest[0].s < .5 * toks.length) { reset(); st.textContent = T('No project matches. All projects are shown.'); return; }
                show(closest);
                st.textContent = T('No exact match. The closest projects:');
            }
        };
        let tm; q.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(run, 90); });
        q.addEventListener('keydown', e => { if (e.key === 'Escape') { q.value = ''; reset(); } });
        // grid or list, remembered on this device
        const vs = [...document.querySelectorAll('.pf-v')];
        const view = v => { list.classList.toggle('is-list', v === 'list'); vs.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v))); try { localStorage.setItem('pf-view', v); } catch (e) {} };
        vs.forEach(b => b.addEventListener('click', () => view(b.dataset.view)));
        try { if (localStorage.getItem('pf-view') === 'list') view('list'); } catch (e) {}
    }
    // about: stagger in when it scrolls into view
    const about = document.querySelector('.about');
    if (about) { if (reduced || !('IntersectionObserver' in window)) about.classList.add('in'); else { const ao = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { about.classList.add('in'); ao.disconnect(); } }), { threshold: .12 }); ao.observe(about); } }
    // map: live coordinates under the cursor (plate carrée; the extent is on .coord as data-extent)
    const mi = document.querySelector('.map-inner'), svg = mi && mi.querySelector('svg.sheet-map'), co = mi && mi.querySelector('.coord');
    if (mi && svg && co && fine) {
        mi.classList.add('crosshair');
        svg.addEventListener('pointermove', e => {
            const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
            const [l0, l1, b0, b1] = (co.dataset.extent || '-1 26 3.5 18').split(' ').map(Number), lon = l0 + x * (l1 - l0), lat = b1 - y * (b1 - b0), m = mi.getBoundingClientRect();
            co.textContent = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}  ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
            co.style.setProperty('--cx', (e.clientX - m.left + 12) + 'px'); co.style.setProperty('--cy', (e.clientY - m.top + 12) + 'px'); co.classList.add('on');
        });
        svg.addEventListener('pointerleave', () => co.classList.remove('on'));
    }

    const sheet = document.querySelector('.sheet');
    if (!sheet) return;
    // footprints draw themselves once, when the sheet first shows
    if (!reduced) requestAnimationFrame(() => sheet.classList.add('drawn'));

    // legend <-> map: highlight one study everywhere it appears
    const set = n => {
        sheet.classList.toggle('focus', !!n);
        sheet.querySelectorAll('[data-n]').forEach(el => el.classList.toggle('on', el.dataset.n === n));
    };
    sheet.querySelectorAll('.leg, .fp, .badge').forEach(el => {
        el.addEventListener('mouseenter', () => set(el.dataset.n));
        el.addEventListener('mouseleave', () => set(null));
        el.addEventListener('focusin', () => set(el.dataset.n || (el.closest('[data-n]') || {}).dataset?.n));
        el.addEventListener('focusout', () => set(null));
    });
})();

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
    // projects and tools: filter pills with live counts, and a grid or row view remembered on this device
    const list = document.querySelector('#studies .inset-list');
    if (list) {
        const T = k => (window.I18N && window.I18N[k]) || k;
        const cards = [...list.querySelectorAll('.inset')];
        const pills = [...document.querySelectorAll('.pf-f')];
        const views = [...document.querySelectorAll('.pf-v')];
        const status = document.getElementById('pf-status');
        const match = (card, f) => f === 'all' || card.dataset.cat === f;
        pills.forEach(p => { const n = p.querySelector('.pf-n'); if (n) n.textContent = cards.filter(c => match(c, p.dataset.filter)).length; });
        const filter = f => {
            let shown = 0;
            cards.forEach(c => { const on = match(c, f); c.classList.toggle('pf-hide', !on); if (on) { shown++; c.classList.add('in'); } });
            pills.forEach(p => p.setAttribute('aria-pressed', String(p.dataset.filter === f)));
            if (status) status.textContent = T('{n} shown').replace('{n}', shown);
        };
        const view = v => {
            list.classList.toggle('is-row', v === 'row');
            views.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
            try { localStorage.setItem('pf-view', v); } catch (e) {}
        };
        pills.forEach(p => p.addEventListener('click', () => filter(p.dataset.filter)));
        views.forEach(b => b.addEventListener('click', () => view(b.dataset.view)));
        try { if (localStorage.getItem('pf-view') === 'row') view('row'); } catch (e) {}
        // the "Tools" menu link opens the catalogue filtered to the tools
        const toTools = () => filter('tool');
        document.querySelectorAll('a[data-filter-link]').forEach(a => a.addEventListener('click', () => filter(a.dataset.filterLink)));
        if (location.hash === '#tools') toTools();
        addEventListener('hashchange', () => { if (location.hash === '#tools') toTools(); });
    }
    // certificates: hover, focus, click or the arrows choose the certificate on top; the arrows follow the hovered row
    const ct = document.querySelector('.ct');
    if (ct) {
        const top = ct.querySelector('.ct-top'), rows = [...ct.querySelectorAll('.ct-row')];
        const base = (window.SITE_ROOT || '') + 'assets/certificates/';
        let cur = 0;
        const show = (i, animate = true) => {
            cur = (i + rows.length) % rows.length; const r = rows[cur];
            rows.forEach((x, k) => x.setAttribute('aria-pressed', String(k === cur)));
            const src = base + r.dataset.slug + '.webp';
            if (top.getAttribute('src') === src) return;
            top.src = src;
            top.alt = `${(window.I18N && window.I18N['Certificate:']) || 'Certificate:'} ${r.querySelector('.ct-c').textContent}, ${r.querySelector('.ct-i').textContent}`;
            if (animate && !reduced) top.animate([{ transform: 'translateY(6px)', opacity: .25 }, { transform: 'none', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.2,.7,.2,1)' });
        };
        rows.forEach((r, i) => { r.addEventListener('mouseenter', () => show(i)); r.addEventListener('focus', () => show(i)); r.addEventListener('click', () => { show(i); if (matchMedia('(max-width: 860px)').matches) ct.querySelector('.ct-side').scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }); }); });
        ct.querySelectorAll('.ct-step').forEach(b => b.addEventListener('click', () => show(cur + +b.dataset.step)));
        ct.addEventListener('keydown', e => { if (e.target.closest('.ct-row, .ct-step') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); show(cur + (e.key === 'ArrowRight' ? 1 : -1)); if (e.target.closest('.ct-row')) rows[cur].focus({ preventScroll: true }); } });
        top.addEventListener('contextmenu', e => e.preventDefault());   // a view, not a download: no save-image menu on the certificate
        rows.forEach(r => { const im = new Image(); im.src = base + r.dataset.slug + '.webp'; });   // warm the cache so the swap is instant
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

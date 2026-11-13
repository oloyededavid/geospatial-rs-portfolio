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
        const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.setAttribute('aria-current', a.hash === '#' + e.target.id ? 'true' : 'false')); }), { rootMargin: '-45% 0px -50% 0px' });
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
    // study reels: a fast recap of each study's maps and figures, playing while the row is in view
    document.querySelectorAll('.reel').forEach(reel => {
        const srcs = JSON.parse(reel.dataset.frames || '[]'), caps = JSON.parse(reel.dataset.caps || '[]');
        const cap = reel.querySelector('.reel-cap'), segs = [...reel.querySelectorAll('.reel-bar i')], first = reel.querySelector('.frame');
        let frames = [first], k = 0, timer = null, loaded = false, paused = false;
        const DUR = 2600;
        const load = () => { if (loaded) return; loaded = true; srcs.forEach(src => { const im = new Image(); im.className = 'frame'; im.alt = ''; im.decoding = 'async'; im.src = src; reel.insertBefore(im, cap); frames.push(im); }); };
        const show = i => {
            frames.forEach((f, j) => f.classList.toggle('on', j === i));
            segs.forEach((s, j) => { s.classList.toggle('done', j < i); s.classList.remove('now'); });
            void (segs[i] && segs[i].offsetWidth); segs[i] && segs[i].classList.add('now'); segs[i] && segs[i].style.setProperty('--dur', DUR + 'ms');
            cap.textContent = caps[i] || ''; k = i;
        };
        const tick = () => { if (!paused) show((k + 1) % frames.length); timer = setTimeout(tick, DUR); };
        const start = () => { if (reduced || timer) return; load(); reel.classList.add('playing'); show(k); timer = setTimeout(tick, DUR); };
        const stop = () => { clearTimeout(timer); timer = null; reel.classList.remove('playing'); };
        const row = reel.closest('.inset');
        row.addEventListener('mouseenter', () => { paused = true; }); row.addEventListener('mouseleave', () => { paused = false; });
        if (reduced) { load(); show(0); reel.addEventListener('click', () => show((k + 1) % frames.length)); return; }
        if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: .35 }).observe(reel);
    });


    // reveal: section rules and the legend
    if ('IntersectionObserver' in window && !reduced) {
        const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }), { threshold: .2 });
        document.querySelectorAll('.sec-head, .legend').forEach(el => ro.observe(el));
    } else document.querySelectorAll('.sec-head, .legend').forEach(el => el.classList.add('in'));



    // about: copy the email address, and say so
    document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
        const label = b.querySelector('span'), was = label.textContent;
        try { await navigator.clipboard.writeText(b.dataset.copy); label.textContent = 'Copied'; }
        catch (e) { location.href = 'mailto:' + b.dataset.copy; return; }
        setTimeout(() => { label.textContent = was; }, 1800);
    }));
    // about: stagger in when it scrolls into view
    const about = document.querySelector('.about');
    if (about) { if (reduced || !('IntersectionObserver' in window)) about.classList.add('in'); else { const ao = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { about.classList.add('in'); ao.disconnect(); } }), { threshold: .12 }); ao.observe(about); } }
    // map: live coordinates under the cursor (equirectangular, 1°W–26°E, 3.5–18°N)
    const mi = document.querySelector('.map-inner'), svg = mi && mi.querySelector('svg.sheet-map'), co = mi && mi.querySelector('.coord');
    if (mi && svg && co && fine) {
        mi.classList.add('crosshair');
        svg.addEventListener('pointermove', e => {
            const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
            const lon = -1 + x * 27, lat = 18 - y * 14.5, m = mi.getBoundingClientRect();
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

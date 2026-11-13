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

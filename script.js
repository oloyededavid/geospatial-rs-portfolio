/* Small enhancements only. The page works without it:
   reveal on scroll, footprints drawing in, and the legend linked to the map. */
(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = [...document.querySelectorAll('.reveal')];
    if (reduced || !('IntersectionObserver' in window)) items.forEach(el => el.classList.add('in'));
    else {
        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        items.forEach(el => io.observe(el));
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

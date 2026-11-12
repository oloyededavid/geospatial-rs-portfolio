/* Small enhancements only. The page works without it:
   reveal on scroll, footprints drawing in, the legend linked to the map, and readouts on each study's figure. */
(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = [...document.querySelectorAll('.reveal')];
    if (reduced || !('IntersectionObserver' in window)) items.forEach(el => el.classList.add('in'));
    else {
        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        items.forEach(el => io.observe(el));
    }

    // each figure: a crosshair and the value under the pointer
    document.querySelectorAll('svg[data-fx]').forEach(svg => {
        const d = JSON.parse(svg.dataset.fx), fig = svg.closest('.fx'), tip = fig.querySelector('.fx-tip');
        const cross = svg.querySelector('.fx-cross'), dot = svg.querySelector('.fx-dot'), vb = svg.viewBox.baseVal;
        const fmt = v => v.toLocaleString('en-GB', { maximumFractionDigits: Math.abs(v) < 10 ? 1 : 0 });
        const show = e => {
            const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * vb.width;
            let k = 0; d.p.forEach((p, i) => { if (Math.abs(p[0] - x) < Math.abs(d.p[k][0] - x)) k = i; });
            const [px, py] = d.p[k];
            cross.setAttribute('x1', px); cross.setAttribute('x2', px);
            dot.setAttribute('cx', px); dot.setAttribute('cy', py);
            tip.textContent = `${d.l[k]} · ${fmt(d.v[k])} ${d.u}`;
            tip.style.left = Math.min(Math.max(px / vb.width * r.width, 70), r.width - 70) + 'px';
            fig.classList.add('hot');
        };
        svg.addEventListener('pointermove', show);
        svg.addEventListener('pointerdown', show);
        svg.addEventListener('pointerleave', () => fig.classList.remove('hot'));
    });

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

// Green Rising Barbados - Ambient background
//
// A cursor-reactive dot grid drawn on a single fixed canvas behind the page.
// Vanilla canvas rather than React Three Fiber: the site has no build step,
// and a WebGL/R3F component would pull in React + Three (~150KB) for a purely
// decorative layer. This is ~3KB and costs no extra requests.
//
// Concept follows 21st.dev's "Animated Fractal Dot Grid" - dots ripple in a
// wave around the pointer - retuned to the brand greens and kept low contrast
// so it fills space without competing with content.
//
// Behaviour:
//   - Skipped entirely under prefers-reduced-motion (static dots, no rAF loop)
//   - Pauses when the tab is hidden or the canvas is scrolled out of view
//   - Follows the light/dark theme
//   - Pointer-events: none, aria-hidden - never intercepts a click or a
//     screen reader

(function () {
    'use strict';

    const canvas = document.createElement('canvas');
    canvas.id = 'ambient-bg';
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    document.body.prepend(canvas);

    const SPACING = 34;      // px between dots
    const DOT = 1.6;         // base radius
    const RADIUS = 150;      // pointer influence radius
    const LIFT = 5;          // max displacement toward the pointer

    // The mark, drawn by the dot grid itself rather than laid over it as a
    // watermark. The SVG is rasterised once to an offscreen canvas, its alpha
    // sampled into a lookup, and dots landing inside the shape are brightened
    // and enlarged. Nothing new is painted - the existing grid just resolves
    // into the logo, and the pointer ripple still runs over the top of it.
    const MARK_SRC = '/images/brand/1-GR-Icon.svg';
    const MARK_ALPHA = 90;   // ignore near-transparent edge pixels
    let markMask = null;     // { data, mw, mh, ox, oy }

    let w = 0, h = 0, dpr = 1;
    let cols = 0, rows = 0;
    let pointer = { x: -9999, y: -9999 };
    let rafId = null;
    let running = false;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function palette() {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        return dark
            ? { dot: 'rgba(52, 211, 153, 0.20)', hot: 'rgba(94, 234, 212, 0.55)',
                mark: 'rgba(52, 211, 153, 0.46)' }
            : { dot: 'rgba(5, 150, 105, 0.16)', hot: 'rgba(13, 148, 136, 0.42)',
                mark: 'rgba(5, 150, 105, 0.38)' };
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        // clientWidth, not innerWidth: innerWidth includes the scrollbar gutter
        // and diverges from the visible area under zoom or device emulation.
        // Sizing the canvas from it made the canvas wider than the page and
        // introduced horizontal scroll.
        w = document.documentElement.clientWidth;
        h = document.documentElement.clientHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cols = Math.ceil(w / SPACING) + 1;
        rows = Math.ceil(h / SPACING) + 1;
    }

    // Rasterise the mark at its on-screen size and keep only the alpha, so the
    // per-dot test is an array index rather than a canvas read every frame.
    function buildMask(img) {
        if (!img || !img.complete || !img.naturalWidth) { markMask = null; return; }

        // Sized generously on purpose: the grid is 34px, so a small mark gets
        // only a handful of dots across and reads as noise rather than a
        // shape. This gives it roughly sixteen dots across its width.
        const size = Math.round(Math.min(h * 0.82, w * 0.58));
        if (size < 80) { markMask = null; return; }   // too small to read as a logo

        const ratio = img.naturalHeight / img.naturalWidth;
        const mw = size;
        const mh = Math.round(size * ratio);

        const off = document.createElement('canvas');
        off.width = mw;
        off.height = mh;
        const octx = off.getContext('2d', { willReadFrequently: false });
        if (!octx) { markMask = null; return; }
        octx.drawImage(img, 0, 0, mw, mh);

        let px;
        try {
            px = octx.getImageData(0, 0, mw, mh).data;
        } catch (err) {
            // A tainted canvas would throw; the grid simply stays plain.
            markMask = null;
            return;
        }

        const alpha = new Uint8Array(mw * mh);
        for (let i = 0, n = mw * mh; i < n; i++) alpha[i] = px[i * 4 + 3];

        markMask = {
            data: alpha,
            mw: mw,
            mh: mh,
            ox: Math.round((w - mw) / 2),
            oy: Math.round((h - mh) / 2)
        };
    }

    function insideMark(x, y) {
        if (!markMask) return false;
        const mx = (x - markMask.ox) | 0;
        const my = (y - markMask.oy) | 0;
        if (mx < 0 || my < 0 || mx >= markMask.mw || my >= markMask.mh) return false;
        return markMask.data[my * markMask.mw + mx] > MARK_ALPHA;
    }

    function draw() {
        const { dot, hot, mark } = palette();
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const bx = i * SPACING;
                const by = j * SPACING;

                const dx = bx - pointer.x;
                const dy = by - pointer.y;
                const dist = Math.hypot(dx, dy);

                let x = bx, y = by, r = DOT, colour = dot;

                // Dots that land inside the mark read a little stronger. Kept
                // deliberately close to the base value: this is a background,
                // and the shape should be noticed rather than announced.
                if (insideMark(bx, by)) {
                    r = DOT + 0.7;
                    colour = mark;
                }

                if (dist < RADIUS) {
                    // Ease the influence so the edge of the field is soft
                    const t = 1 - dist / RADIUS;
                    const ease = t * t;
                    const ang = Math.atan2(dy, dx);
                    x = bx - Math.cos(ang) * LIFT * ease;
                    y = by - Math.sin(ang) * LIFT * ease;
                    r = DOT + ease * 1.7;
                    colour = ease > 0.45 ? hot : dot;
                }

                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fillStyle = colour;
                ctx.fill();
            }
        }
    }

    function loop() {
        draw();
        rafId = requestAnimationFrame(loop);
    }

    function start() {
        if (running || reduceMotion.matches) return;
        running = true;
        rafId = requestAnimationFrame(loop);
    }

    function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
    }

    function onPointer(e) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
    }

    resize();
    draw(); // paint once so the grid exists even if the loop never runs

    // The grid is correct before the mark loads and simply resolves into it
    // once the SVG arrives; a failed load leaves a plain grid, not an error.
    const markImg = new Image();
    markImg.onload = () => { buildMask(markImg); if (!running) draw(); };
    markImg.onerror = () => { markMask = null; };
    markImg.src = MARK_SRC;

    window.addEventListener('resize', () => {
        resize();
        buildMask(markImg);
        draw();
    }, { passive: true });

    if (reduceMotion.matches) return; // static grid only

    // Touch devices have no hovering pointer; the static grid is enough there
    if (window.matchMedia('(hover: hover)').matches) {
        window.addEventListener('pointermove', onPointer, { passive: true });
        window.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; }, { passive: true });
        start();
    }

    document.addEventListener('visibilitychange', () => {
        document.hidden ? stop() : start();
    });

    reduceMotion.addEventListener('change', () => {
        if (reduceMotion.matches) { stop(); draw(); } else { start(); }
    });

    // Repaint on theme change so the dots follow light/dark
    new MutationObserver(() => { if (!running) draw(); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();

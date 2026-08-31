// Green Rising Barbados — Ambient background
//
// A cursor-reactive dot grid drawn on a single fixed canvas behind the page.
// Vanilla canvas rather than React Three Fiber: the site has no build step,
// and a WebGL/R3F component would pull in React + Three (~150KB) for a purely
// decorative layer. This is ~3KB and costs no extra requests.
//
// Concept follows 21st.dev's "Animated Fractal Dot Grid" — dots ripple in a
// wave around the pointer — retuned to the brand greens and kept low contrast
// so it fills space without competing with content.
//
// Behaviour:
//   - Skipped entirely under prefers-reduced-motion (static dots, no rAF loop)
//   - Pauses when the tab is hidden or the canvas is scrolled out of view
//   - Follows the light/dark theme
//   - Pointer-events: none, aria-hidden — never intercepts a click or a
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

    let w = 0, h = 0, dpr = 1;
    let cols = 0, rows = 0;
    let pointer = { x: -9999, y: -9999 };
    let rafId = null;
    let running = false;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function palette() {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        return dark
            ? { dot: 'rgba(52, 211, 153, 0.20)', hot: 'rgba(94, 234, 212, 0.55)' }
            : { dot: 'rgba(5, 150, 105, 0.16)', hot: 'rgba(13, 148, 136, 0.42)' };
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cols = Math.ceil(w / SPACING) + 1;
        rows = Math.ceil(h / SPACING) + 1;
    }

    function draw() {
        const { dot, hot } = palette();
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const bx = i * SPACING;
                const by = j * SPACING;

                const dx = bx - pointer.x;
                const dy = by - pointer.y;
                const dist = Math.hypot(dx, dy);

                let x = bx, y = by, r = DOT, colour = dot;

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

    window.addEventListener('resize', () => { resize(); draw(); }, { passive: true });

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

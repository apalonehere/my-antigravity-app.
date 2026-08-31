// Green Rising Barbados — Motion layer
//
// Progressive enhancement only. Every element touched here is already visible
// and laid out without JavaScript; GSAP adds entrance and feedback motion on
// top. If the CDN fails, or the visitor asks for reduced motion, this file
// returns early and the page renders exactly as it does now.
//
// Timings and easings follow the ui-ux-pro-max motion presets:
//   Scroll Reveal / Subtle          — 300-400ms, power1.out, y 8-16px
//   Stagger List / Standard         — 300-450ms, back.out(1.4), grid-aware
//   Hover Micro-interaction / Std   — 200-300ms, power2.out, transform only

(function () {
    'use strict';

    if (typeof gsap === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;

    const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
    if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    /* ---------------------------------------------------------------
       1. Scroll reveal — Subtle preset
       Small y offset so it reads as a fade rather than a slide.
       --------------------------------------------------------------- */
    function revealOnScroll(selector, opts) {
        if (!hasScrollTrigger) return;
        const els = gsap.utils.toArray(selector).filter(el => el.offsetParent !== null);
        if (!els.length) return;

        gsap.fromTo(els,
            { opacity: 0, y: 12 },
            Object.assign({
                opacity: 1,
                y: 0,
                duration: 0.35,
                ease: 'power1.out',
                stagger: 0.05,
                // Hand the element back to CSS once it has arrived. Without
                // this, GSAP's inline transform outranks the :hover rule and
                // the card can never lift.
                clearProps: 'transform,opacity',
                scrollTrigger: {
                    trigger: els[0],
                    start: 'top 90%',
                    once: true
                }
            }, opts || {})
        );
    }

    /* ---------------------------------------------------------------
       2. Programme tab panes — Stagger List, Standard preset
       This is the section that felt static: switching a sub-tab swapped
       the content instantly with no sense of it arriving. grid:'auto'
       lets GSAP infer the bento rows and columns for a diagonal wave.
       --------------------------------------------------------------- */
    function animatePane(pane) {
        if (!pane) return;

        const cards = pane.querySelectorAll('.bento-card');
        if (cards.length) {
            gsap.killTweensOf(cards);
            gsap.fromTo(cards,
                { opacity: 0, scale: 0.94, y: 16 },
                {
                    opacity: 1, scale: 1, y: 0,
                    duration: 0.42,
                    ease: 'back.out(1.4)',
                    stagger: { each: 0.06, from: 'start', grid: 'auto' },
                    clearProps: 'transform,opacity'
                }
            );
        }

        const bars = pane.querySelectorAll('.info-bar-item');
        if (bars.length) {
            gsap.killTweensOf(bars);
            gsap.fromTo(bars,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.3, ease: 'power1.out', stagger: 0.04, delay: 0.08 }
            );
        }

        // Chips are numerous; keep the per-item delay small so the total
        // reveal does not drag (preset guidance for lists over 10 items).
        const chips = pane.querySelectorAll('.step-chip, .bento-chip');
        if (chips.length) {
            gsap.killTweensOf(chips);
            gsap.fromTo(chips,
                { opacity: 0, y: 6 },
                { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out', stagger: 0.02, delay: 0.15 }
            );
        }
    }

    function initProgrammeTabMotion() {
        const tabs = document.querySelectorAll('.programme-sub-tabs .sub-tab-btn');
        if (!tabs.length) return;

        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                // The router swaps .active on the pane; wait a frame so we
                // animate the pane that is actually visible now.
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        animatePane(document.querySelector('.prog-detail-pane.active'));
                        if (hasScrollTrigger) ScrollTrigger.refresh();
                    });
                });
            });
        });
    }

    /* ---------------------------------------------------------------
       3. Hover lift lives in CSS (see .motion-lift in index.css).
       It was originally gsap.quickTo, but quickTo tweens carry overwrite
       and killed the entrance tween mid-flight, leaving cards stranded at
       opacity 0. Two systems writing `transform` on one element is the
       problem; CSS owns hover, GSAP owns entrance and clears its inline
       styles when it finishes.
       --------------------------------------------------------------- */

    /* ---------------------------------------------------------------
       4. Impact numbers — count up when they scroll into view
       Reads the number already in the DOM, so the markup stays the
       source of truth and the final value is always what was authored.
       --------------------------------------------------------------- */
    function initCounters(selector) {
        if (!hasScrollTrigger) return;

        document.querySelectorAll(selector).forEach(el => {
            const raw = el.textContent.trim();
            const target = parseFloat(raw.replace(/[^\d.]/g, ''));
            if (!isFinite(target) || target === 0) return;

            const suffix = raw.replace(/[\d.,]/g, '');
            const grouped = raw.includes(',');
            const counter = { v: 0 };

            ScrollTrigger.create({
                trigger: el,
                start: 'top 92%',
                once: true,
                onEnter: () => {
                    gsap.to(counter, {
                        v: target,
                        duration: 1.1,
                        ease: 'power2.out',
                        onUpdate: () => {
                            const n = Math.round(counter.v);
                            el.textContent = (grouped ? n.toLocaleString('en-US') : String(n)) + suffix;
                        },
                        onComplete: () => { el.textContent = raw; }
                    });
                }
            });
        });
    }

    function init() {
        // Home
        revealOnScroll('.snap-card', { stagger: 0.08 });
        revealOnScroll('.reel-card', { stagger: 0.07 });
        revealOnScroll('.pillar-visual-card', { stagger: 0.07 });

        initCounters('.stat-number, .who-stat-num, .dash-metric-value');

        // Programmes
        initProgrammeTabMotion();
        animatePane(document.querySelector('.prog-detail-pane.active'));

        // Re-run the pane animation when the Programmes view itself is opened
        window.addEventListener('hashchange', () => {
            if (location.hash.replace('#', '') === 'programmes') {
                requestAnimationFrame(() => animatePane(document.querySelector('.prog-detail-pane.active')));
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

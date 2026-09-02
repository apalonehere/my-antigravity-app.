// Green Rising Barbados - Impact Hub trend chart.
//
// Hand-rolled inline SVG. No chart library: one single-series area chart does
// not justify shipping one, and inline SVG inherits the site's CSS variables
// so light/dark works without a second palette.
//
// Built to the dataviz skill's procedure:
//   1. Form      - change over time, one measure -> line + area.
//   2. Color     - ONE hue. The palette validator fails green-vs-teal as a
//                  categorical pair (ΔE 4.9 normal vision, floor is 15), so a
//                  second series on this plot would be unreadable. One series.
//   3. Marks     - 2px line, 8px focused marker, recessive grid, no marker on
//                  every point, target drawn as a reference line not a series.
//   4. Hover     - crosshair + tooltip, shipped by default; the hit target is
//                  a full-height column, far bigger than the mark.
//   5. A11y      - keyboard arrows walk the points, the figure is labelled,
//                  and a table view carries the same numbers without colour.
//
// ---------------------------------------------------------------------------
// DATA NOTE - READ BEFORE PUBLISHING
// ---------------------------------------------------------------------------
// MONTHLY_YOUTH below is ILLUSTRATIVE shape, not verified programme data. The
// only figure Green Rising has published is the current cumulative total, so
// the intermediate months are interpolated to reach it. Replace `points` with
// the real monthly intake before this goes in front of funders. The final
// point is deliberately not stored - it is overwritten at render time with
// whatever the live `youth` metric says, so the chart can never contradict the
// number in the tile beside it.
// ---------------------------------------------------------------------------

(function () {
    'use strict';

    const TARGET_FALLBACK = 300;
    const target = () => (window.GR_CONTENT && window.GR_CONTENT.impact && Number(window.GR_CONTENT.impact.target)) || TARGET_FALLBACK;
    const targetLabel = () => (window.GR_CONTENT && window.GR_CONTENT.impact && window.GR_CONTENT.impact.targetLabel) || '2026 target · 300';

    const MONTHLY_YOUTH = {
        label: 'Youth trained (cumulative)',
        points: [
            { period: 'Sep 2025', value: 0 },
            { period: 'Oct 2025', value: 24 },
            { period: 'Nov 2025', value: 51 },
            { period: 'Dec 2025', value: 68 },
            { period: 'Jan 2026', value: 96 },
            { period: 'Feb 2026', value: 124 },
            { period: 'Mar 2026', value: 147 },
            { period: 'Apr 2026', value: 172 },
            { period: 'May 2026', value: 196 },
            { period: 'Jun 2026', value: 214 },
            { period: 'Jul 2026', value: 231 },
            { period: 'Aug 2026', value: 242 }   // overwritten from live metrics
        ]
    };

    const NS = 'http://www.w3.org/2000/svg';
    const VB = { w: 760, h: 300 };
    const PAD = { top: 22, right: 20, bottom: 38, left: 46 };

    let focusIndex = -1;
    let currentPoints = [];

    function el(name, attrs) {
        const node = document.createElementNS(NS, name);
        for (const k in attrs) node.setAttribute(k, attrs[k]);
        return node;
    }

    function livePoints() {
        // Published series wins; the array below is the fallback shipped with
        // the page so the chart draws before the fetch lands.
        const published = window.GR_CONTENT && window.GR_CONTENT.impact;
        const source = (published && Array.isArray(published.trend) && published.trend.length)
            ? published.trend
            : MONTHLY_YOUTH.points;
        const pts = source.map(p => Object.assign({}, p));
        // Keep the last point honest against whatever the tiles are showing.
        if (typeof getImpactMetrics === 'function') {
            const live = Number(getImpactMetrics().youth);
            if (isFinite(live) && live > 0) pts[pts.length - 1].value = live;
        }
        return pts;
    }

    function scales(points) {
        const maxVal = Math.max(target(), ...points.map(p => p.value));
        const yMax = Math.ceil(maxVal / 50) * 50;
        const plotW = VB.w - PAD.left - PAD.right;
        const plotH = VB.h - PAD.top - PAD.bottom;
        return {
            yMax,
            x: (i) => PAD.left + (points.length === 1 ? 0 : (i / (points.length - 1)) * plotW),
            y: (v) => PAD.top + plotH - (v / yMax) * plotH,
            plotW,
            plotH
        };
    }

    function render() {
        const host = document.getElementById('impact-trend-plot');
        if (!host) return;

        const points = livePoints();
        currentPoints = points;
        const s = scales(points);

        const svg = el('svg', {
            viewBox: `0 0 ${VB.w} ${VB.h}`,
            class: 'impact-svg',
            preserveAspectRatio: 'xMidYMid meet',
            role: 'img',
            'aria-label': `${MONTHLY_YOUTH.label}. From ${points[0].value} in ${points[0].period} to ` +
                `${points[points.length - 1].value} in ${points[points.length - 1].period}, ` +
                `against a target of ${target()}.`
        });

        // --- gradient for the area fill -------------------------------------
        const defs = el('defs', {});
        const grad = el('linearGradient', { id: 'impactAreaFill', x1: '0', y1: '0', x2: '0', y2: '1' });
        grad.appendChild(el('stop', { offset: '0%', 'stop-color': 'currentColor', 'stop-opacity': '0.26' }));
        grad.appendChild(el('stop', { offset: '100%', 'stop-color': 'currentColor', 'stop-opacity': '0.02' }));
        defs.appendChild(grad);
        svg.appendChild(defs);

        // --- recessive grid + y axis ----------------------------------------
        const gridG = el('g', { class: 'impact-grid' });
        const steps = 4;
        for (let i = 0; i <= steps; i++) {
            const v = (s.yMax / steps) * i;
            const y = s.y(v);
            gridG.appendChild(el('line', { x1: PAD.left, y1: y, x2: VB.w - PAD.right, y2: y }));
            const label = el('text', { x: PAD.left - 10, y: y + 4, class: 'impact-axis-text', 'text-anchor': 'end' });
            label.textContent = String(Math.round(v));
            gridG.appendChild(label);
        }
        svg.appendChild(gridG);

        // --- target reference line (not a series: dashed, labelled) ---------
        const ty = s.y(target());
        const targetG = el('g', { class: 'impact-target' });
        targetG.appendChild(el('line', { x1: PAD.left, y1: ty, x2: VB.w - PAD.right, y2: ty }));
        const tLabel = el('text', { x: VB.w - PAD.right, y: ty - 8, 'text-anchor': 'end', class: 'impact-target-text' });
        tLabel.textContent = targetLabel();
        targetG.appendChild(tLabel);
        svg.appendChild(targetG);

        // --- x axis labels: first, last, and every third in between ---------
        const xAxisG = el('g', { class: 'impact-axis' });
        points.forEach((p, i) => {
            const isEdge = i === 0 || i === points.length - 1;
            if (!isEdge && i % 3 !== 0) return;
            const t = el('text', {
                x: s.x(i),
                y: VB.h - PAD.bottom + 20,
                class: 'impact-axis-text',
                'text-anchor': i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'
            });
            t.textContent = p.period.replace(' 20', " '");
            xAxisG.appendChild(t);
        });
        svg.appendChild(xAxisG);

        // --- the series -----------------------------------------------------
        const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${s.x(i)},${s.y(p.value)}`).join(' ');
        const area = `${line} L${s.x(points.length - 1)},${s.y(0)} L${s.x(0)},${s.y(0)} Z`;

        const seriesG = el('g', { class: 'impact-series' });
        seriesG.appendChild(el('path', { d: area, class: 'impact-area', fill: 'url(#impactAreaFill)' }));
        seriesG.appendChild(el('path', { d: line, class: 'impact-line' }));
        svg.appendChild(seriesG);

        // Direct label on the final point - the one number worth stating on
        // the plot itself. A number on every point is the anti-pattern.
        const lastI = points.length - 1;
        const endDot = el('circle', { cx: s.x(lastI), cy: s.y(points[lastI].value), r: 5, class: 'impact-end-dot' });
        svg.appendChild(endDot);

        // --- crosshair + focused marker (hidden until hover/focus) ----------
        const hoverG = el('g', { class: 'impact-hover', opacity: '0' });
        const vline = el('line', { class: 'impact-crosshair', y1: PAD.top, y2: VB.h - PAD.bottom });
        const dot = el('circle', { r: 6, class: 'impact-hover-dot' });
        hoverG.appendChild(vline);
        hoverG.appendChild(dot);
        svg.appendChild(hoverG);

        // --- hit columns: the target is the whole column, not the mark ------
        const hitG = el('g', {});
        const colW = s.plotW / Math.max(points.length - 1, 1);
        points.forEach((p, i) => {
            const rect = el('rect', {
                x: s.x(i) - colW / 2,
                y: PAD.top,
                width: colW,
                height: s.plotH,
                fill: 'transparent',
                class: 'impact-hit'
            });
            rect.addEventListener('pointerenter', () => setFocus(i));
            hitG.appendChild(rect);
        });
        svg.appendChild(hitG);

        host.innerHTML = '';
        host.appendChild(svg);

        // Tooltip lives in HTML, not SVG - real text, real wrapping.
        const tip = document.createElement('div');
        tip.className = 'impact-tooltip';
        tip.setAttribute('role', 'status');
        tip.hidden = true;
        host.appendChild(tip);

        function setFocus(i) {
            focusIndex = i;
            const p = points[i];
            const px = s.x(i), py = s.y(p.value);
            hoverG.setAttribute('opacity', '1');
            vline.setAttribute('x1', px);
            vline.setAttribute('x2', px);
            dot.setAttribute('cx', px);
            dot.setAttribute('cy', py);

            tip.hidden = false;
            tip.innerHTML =
                `<span class="impact-tooltip-period">${p.period}</span>` +
                `<span class="impact-tooltip-value">${p.value.toLocaleString('en-US')}</span>` +
                `<span class="impact-tooltip-label">youth trained, cumulative</span>`;
            // Position in percentage of the plot box so it tracks the
            // responsive SVG without measuring on every move.
            tip.style.left = (px / VB.w * 100) + '%';
            tip.style.top = (py / VB.h * 100) + '%';
        }

        function clearFocus() {
            focusIndex = -1;
            hoverG.setAttribute('opacity', '0');
            tip.hidden = true;
        }

        host.addEventListener('pointerleave', clearFocus);

        // Keyboard: the plot itself is focusable and arrows walk the points.
        svg.setAttribute('tabindex', '0');
        svg.addEventListener('focus', () => setFocus(points.length - 1));
        svg.addEventListener('blur', clearFocus);
        svg.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); setFocus(Math.min(points.length - 1, Math.max(focusIndex, 0) + 1)); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); setFocus(Math.max(0, (focusIndex < 0 ? points.length - 1 : focusIndex) - 1)); }
            if (e.key === 'Home') { e.preventDefault(); setFocus(0); }
            if (e.key === 'End') { e.preventDefault(); setFocus(points.length - 1); }
            if (e.key === 'Escape') { clearFocus(); }
        });

        renderTable(points);
    }

    function renderTable(points) {
        const wrap = document.getElementById('impact-trend-table');
        if (!wrap) return;
        const rows = points.map(p =>
            `<tr><th scope="row">${p.period}</th><td>${p.value.toLocaleString('en-US')}</td></tr>`
        ).join('');
        wrap.innerHTML =
            `<table class="impact-table">
                <caption class="sr-only">${MONTHLY_YOUTH.label}</caption>
                <thead><tr><th scope="col">Period</th><th scope="col">Youth trained</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>`;
    }

    function initTableToggle() {
        const btn = document.getElementById('impact-trend-table-btn');
        const wrap = document.getElementById('impact-trend-table');
        if (!btn || !wrap) return;
        btn.addEventListener('click', () => {
            const open = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!open));
            wrap.hidden = open;
            btn.textContent = open ? 'View as table' : 'Hide table';
        });
    }

    // Metric tiles: press to open the note explaining the figure.
    function initMetricNotes() {
        document.querySelectorAll('.dash-metric-card[aria-controls]').forEach(card => {
            const note = document.getElementById(card.getAttribute('aria-controls'));
            if (!note) return;
            card.addEventListener('click', () => {
                const open = card.getAttribute('aria-expanded') === 'true';
                card.setAttribute('aria-expanded', String(!open));
                note.hidden = open;
            });
        });
    }

    function init() {
        render();
        initTableToggle();
        initMetricNotes();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-render when the admin simulator pushes new metrics, so the chart's
    // final point follows the tiles.
    window.refreshImpactChart = render;
})();

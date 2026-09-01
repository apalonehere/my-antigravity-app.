// --- Impact Dashboard & Admin Simulation Module ---

// Vessels/boats went with the boatbuilding programme; CO2 and coastline went
// with the Environmental Monitor tab. What is left is what the Impact Hub and
// the homepage strip actually display.
const DEFAULT_METRICS = {
    youth: 242,
    water: 85210,
    jobs: 32
};

// Published content wins. The old localStorage copy is gone as a source of
// truth: it only ever changed what one browser saw, which is the opposite of
// what an admin edit is supposed to do.
function getImpactMetrics() {
    const published = window.GR_CONTENT && window.GR_CONTENT.impact;
    if (published && published.metrics) {
        return Object.assign({}, DEFAULT_METRICS, published.metrics);
    }
    return Object.assign({}, DEFAULT_METRICS);
}

function getImpactTarget() {
    const published = window.GR_CONTENT && window.GR_CONTENT.impact;
    return (published && Number(published.target)) || 300;
}

function applyMetricsToUI(newMetrics, animate = false) {
    const m = newMetrics || getImpactMetrics();

    // 1. Homepage & Dashboard Numeric Indicators
    const numericTargets = [
        { id: 'brief-stat-youth', val: m.youth },
        { id: 'brief-stat-water', val: m.water },
        { id: 'brief-stat-jobs',  val: m.jobs },

        { id: 'dash-stat-youth',  val: m.youth },
        { id: 'dash-stat-water',  val: m.water },
        { id: 'dash-stat-jobs',   val: m.jobs },

        { id: 'dash-hero-youth',  val: m.youth },
        { id: 'dash-hero-water',  val: m.water },
        { id: 'dash-hero-jobs',   val: m.jobs }
    ];

    numericTargets.forEach(({ id, val }) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (animate && typeof animateValue === 'function') {
            animateValue(id, val, 800);
        } else {
            el.innerText = Number(val).toLocaleString();
        }
    });

    // 2. 2026 Progress Ring Sync
    const targetPct = Math.min(Math.round((m.youth / getImpactTarget()) * 100), 100);
    const ringValEl = document.getElementById('dash-ring-val');
    const ringFillEl = document.getElementById('dash-ring-fill');
    if (ringValEl) ringValEl.innerText = `${targetPct}%`;
    if (ringFillEl) {
        const offset = 264 - (264 * (targetPct / 100));
        ringFillEl.style.strokeDashoffset = offset;
    }

    // 3. The trend chart's final point tracks the live youth figure, so the
    //    chart and the tile beside it can never disagree.
    if (typeof window.refreshImpactChart === 'function') window.refreshImpactChart();

    // 4. Pre-fill Admin Form Inputs if present
    populateAdminMetricsInputs(m);
}

function populateAdminMetricsInputs(m) {
    const data = m || getImpactMetrics();
    const inputYouth = document.getElementById('metric-input-youth');
    const inputWater = document.getElementById('metric-input-water');
    const inputJobs = document.getElementById('metric-input-jobs');

    if (inputYouth && document.activeElement !== inputYouth) inputYouth.value = data.youth;
    if (inputWater && document.activeElement !== inputWater) inputWater.value = data.water;
    if (inputJobs && document.activeElement !== inputJobs) inputJobs.value = data.jobs;
}

function handleAdminMetricsSubmit(event) {
    if (event) event.preventDefault();

    const youthVal = parseInt(document.getElementById('metric-input-youth')?.value) || 0;
    const waterVal = parseInt(document.getElementById('metric-input-water')?.value) || 0;
    const jobsVal = parseInt(document.getElementById('metric-input-jobs')?.value) || 0;

    const updated = {
        youth: youthVal,
        water: waterVal,
        jobs: jobsVal
    };

    // Deliberately not persisted. Impact figures are published from
    // content/impact.json via the CMS at /admin; writing them to localStorage
    // here would only change this one browser while looking like a save.
    applyMetricsToUI(updated, true);

    const successMsg = document.getElementById('admin-metrics-success-msg');
    if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.classList.remove('hidden');
        setTimeout(() => {
            successMsg.style.display = 'none';
            successMsg.classList.add('hidden');
        }, 4000);
    }
}

function switchDashTab(tabId, btnEl) {
    if (tabId === 'admin' && typeof isAdminAuthenticated === 'function' && !isAdminAuthenticated()) {
        if (typeof switchView === 'function') {
            switchView('login');
            window.location.hash = 'login';
        }
        return;
    }
    // Scoped to the hub's own tab bar: the admin portal reuses .dash-tab-btn
    // for its tabs, and an unscoped query deactivated those too.
    const dashBtns = document.querySelectorAll('.dash-tab-bar .dash-tab-btn');
    const dashPanes = document.querySelectorAll('.dash-pane');

    dashBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.hasAttribute('role')) btn.setAttribute('aria-selected', 'false');
    });
    if (btnEl) {
        btnEl.classList.add('active');
        if (btnEl.hasAttribute('role')) btnEl.setAttribute('aria-selected', 'true');
    }

    dashPanes.forEach(pane => {
        if (pane.id === `dash-tab-${tabId}`) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });
}

function initImpactMetrics() {
    const current = getImpactMetrics();
    applyMetricsToUI(current, false);
}

document.addEventListener('DOMContentLoaded', () => {
    initImpactMetrics();
});

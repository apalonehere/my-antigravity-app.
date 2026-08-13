// --- Impact Dashboard & Admin Simulation Module ---

const DEFAULT_METRICS = {
    youth: 242,
    water: 85210,
    boats: 4,
    jobs: 32,
    co2: 12.8,
    coastline: 1.2
};

function getImpactMetrics() {
    if (typeof localStorage === 'undefined') return Object.assign({}, DEFAULT_METRICS);
    const stored = localStorage.getItem('green_rising_impact_metrics');
    if (stored) {
        try {
            return Object.assign({}, DEFAULT_METRICS, JSON.parse(stored));
        } catch (e) {
            console.error('Failed to parse impact metrics from localStorage', e);
        }
    }
    return Object.assign({}, DEFAULT_METRICS);
}

function applyMetricsToUI(newMetrics, animate = false) {
    const m = newMetrics || getImpactMetrics();

    // 1. Homepage & Dashboard Numeric Indicators
    const numericTargets = [
        { id: 'brief-stat-youth', val: m.youth },
        { id: 'brief-stat-water', val: m.water },
        { id: 'brief-stat-boats', val: m.boats },
        { id: 'brief-stat-jobs',  val: m.jobs },

        { id: 'dash-stat-youth',  val: m.youth },
        { id: 'dash-stat-water',  val: m.water },
        { id: 'dash-stat-boats',  val: m.boats },
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

    // 2. Environmental Monitor Indicators
    const carbonEl = document.getElementById('dash-carbon');
    const coastEl = document.getElementById('dash-coastline');
    if (carbonEl) carbonEl.innerText = `${m.co2} Tons`;
    if (coastEl) coastEl.innerText = `${m.coastline} km`;

    // 3. 2026 Progress Ring Sync
    const targetPct = Math.min(Math.round((m.youth / 300) * 100), 100);
    const ringValEl = document.getElementById('dash-ring-val');
    const ringFillEl = document.getElementById('dash-ring-fill');
    if (ringValEl) ringValEl.innerText = `${targetPct}%`;
    if (ringFillEl) {
        const offset = 264 - (264 * (targetPct / 100));
        ringFillEl.style.strokeDashoffset = offset;
    }

    // 4. Pre-fill Admin Form Inputs if present
    populateAdminMetricsInputs(m);
}

function populateAdminMetricsInputs(m) {
    const data = m || getImpactMetrics();
    const inputYouth = document.getElementById('metric-input-youth');
    const inputWater = document.getElementById('metric-input-water');
    const inputVessels = document.getElementById('metric-input-vessels');
    const inputJobs = document.getElementById('metric-input-jobs');
    const inputCO2 = document.getElementById('metric-input-co2');
    const inputCoastline = document.getElementById('metric-input-coastline');

    if (inputYouth && document.activeElement !== inputYouth) inputYouth.value = data.youth;
    if (inputWater && document.activeElement !== inputWater) inputWater.value = data.water;
    if (inputVessels && document.activeElement !== inputVessels) inputVessels.value = data.boats;
    if (inputJobs && document.activeElement !== inputJobs) inputJobs.value = data.jobs;
    if (inputCO2 && document.activeElement !== inputCO2) inputCO2.value = data.co2;
    if (inputCoastline && document.activeElement !== inputCoastline) inputCoastline.value = data.coastline;
}

function handleAdminMetricsSubmit(event) {
    if (event) event.preventDefault();

    const youthVal = parseInt(document.getElementById('metric-input-youth')?.value) || 0;
    const waterVal = parseInt(document.getElementById('metric-input-water')?.value) || 0;
    const vesselsVal = parseInt(document.getElementById('metric-input-vessels')?.value) || 0;
    const jobsVal = parseInt(document.getElementById('metric-input-jobs')?.value) || 0;
    const co2Val = parseFloat(document.getElementById('metric-input-co2')?.value) || 0;
    const coastlineVal = parseFloat(document.getElementById('metric-input-coastline')?.value) || 0;

    const updated = {
        youth: youthVal,
        water: waterVal,
        boats: vesselsVal,
        jobs: jobsVal,
        co2: co2Val,
        coastline: coastlineVal
    };

    localStorage.setItem('green_rising_impact_metrics', JSON.stringify(updated));
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
    const dashBtns = document.querySelectorAll('.dash-tab-btn');
    const dashPanes = document.querySelectorAll('.dash-pane');

    dashBtns.forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

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

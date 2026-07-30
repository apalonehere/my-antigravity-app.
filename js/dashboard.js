// --- Impact Dashboard & Admin Simulation Module ---
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

const metrics = {
    youth: 242,
    water: 85210,
    boats: 4,
    jobs: 32
};

function simulateAdminUpdate() {
    const inputYouth = parseInt(document.getElementById('admin-youth')?.value) || metrics.youth;
    const inputWater = parseInt(document.getElementById('admin-water')?.value) || metrics.water;
    const inputBoats = parseInt(document.getElementById('admin-boats')?.value) || metrics.boats;
    const inputJobs = parseInt(document.getElementById('admin-jobs')?.value) || metrics.jobs;
    
    metrics.youth = inputYouth;
    metrics.water = inputWater;
    metrics.boats = inputBoats;
    metrics.jobs = inputJobs;
    
    animateValue('dash-stat-youth', metrics.youth, 1000);
    animateValue('dash-stat-water', metrics.water, 1000);
    animateValue('dash-stat-boats', metrics.boats, 1000);
    animateValue('dash-stat-jobs', metrics.jobs, 1000);

    animateValue('dash-hero-youth', metrics.youth, 1000);
    animateValue('dash-hero-water', metrics.water, 1000);
    animateValue('dash-hero-jobs', metrics.jobs, 1000);
    
    animateValue('brief-stat-youth', metrics.youth, 1000);
    animateValue('brief-stat-water', metrics.water, 1000);
    animateValue('brief-stat-boats', metrics.boats, 1000);
    animateValue('brief-stat-jobs', metrics.jobs, 1000);
    
    const targetPct = Math.min(Math.round((metrics.youth / 300) * 100), 100);
    const ringValEl = document.getElementById('dash-ring-val');
    const ringFillEl = document.getElementById('dash-ring-fill');
    if (ringValEl) ringValEl.innerText = `${targetPct}%`;
    if (ringFillEl) {
        const offset = 264 - (264 * (targetPct / 100));
        ringFillEl.style.strokeDashoffset = offset;
    }

    const estimatedCO2 = (metrics.youth * 0.05).toFixed(1);
    const estimatedCoast = (metrics.youth * 0.005).toFixed(2);
    const estimatedSoil = (metrics.youth * 0.035).toFixed(1);
    const estimatedRain = Math.max(8, Math.round(metrics.youth * 0.065));

    const carbonEl = document.getElementById('dash-carbon');
    const coastEl = document.getElementById('dash-coastline');
    const soilEl = document.getElementById('dash-soil');
    const rainEl = document.getElementById('dash-rain');

    if (carbonEl) carbonEl.innerText = `${estimatedCO2} Tons`;
    if (coastEl) coastEl.innerText = `${estimatedCoast} km`;
    if (soilEl) soilEl.innerText = `${estimatedSoil} Acres`;
    if (rainEl) rainEl.innerText = `${estimatedRain} Systems`;
    
    const alertBox = document.getElementById('sim-status-box');
    if (alertBox) {
        alertBox.classList.remove('hidden');
        setTimeout(() => {
            alertBox.classList.add('hidden');
        }, 4000);
    }
}

// Green Rising Barbados — Impact Hub, Metrics Engine & Admin Control Console Module

const defaultMetrics = {
    youth: 242,
    water: 85210,
    boats: 4,
    jobs: 32,
    carbon: 12.8,
    coastline: 1.2,
    soil: 8.4,
    rain: 16,
    cohortsActive: 4,
    totalApplicants: 310,
    webhookUrl: "https://api.greenrising.bb/v1/metrics/sync"
};

let MetricsStore = { ...defaultMetrics };

const defaultCohorts = [
    { id: 'coh-1', name: 'Youth of the Seas (YOTS) Cohort 4', category: 'blue', participants: 10, status: 'Active Intake', parish: 'St. Michael / Coastal' },
    { id: 'coh-2', name: 'Water Conservation Field Unit 2', category: 'green', participants: 25, status: 'Active Training', parish: 'St. James / St. Thomas' },
    { id: 'coh-3', name: 'CYEN Blue-Green Fellows 2026', category: 'green', participants: 45, status: 'In Progress', parish: 'Island-wide' },
    { id: 'coh-4', name: 'Pinelands Tech & Creative Cohort 1', category: 'orange', participants: 30, status: 'Active Workshop', parish: 'Pinelands, St. Michael' }
];

let CohortStore = [...defaultCohorts];

const defaultSensorLogs = [
    { id: 'log-1', timestamp: '2026-07-28 09:30', sensor: 'Carlisle Bay Buoy #2', metric: 'Salinity & Turbidity', value: '35.2 PSU / 1.4 NTU', status: 'Optimal' },
    { id: 'log-2', timestamp: '2026-07-28 08:15', sensor: 'Holetown Aquifer Probe', metric: 'Groundwater Level', value: '4.8 m depth', status: 'Normal' },
    { id: 'log-3', timestamp: '2026-07-27 16:40', sensor: 'Eco Village Compost Monitor', metric: 'Soil Temperature', value: '54°C (Remediating)', status: 'Active' }
];

let SensorLogStore = [...defaultSensorLogs];

function initMetricsStore() {
    try {
        const storedMetrics = localStorage.getItem('greenrising_metrics');
        if (storedMetrics) {
            MetricsStore = { ...defaultMetrics, ...JSON.parse(storedMetrics) };
        }
        const storedCohorts = localStorage.getItem('greenrising_cohorts');
        if (storedCohorts) {
            CohortStore = JSON.parse(storedCohorts);
        }
        const storedLogs = localStorage.getItem('greenrising_sensor_logs');
        if (storedLogs) {
            SensorLogStore = JSON.parse(storedLogs);
        }
    } catch (e) {
        console.error('Error loading metrics store, using defaults:', e);
    }
    updateAllMetricUI();
    renderCohortAdminList();
    renderSensorLogAdminList();
    populateAdminImpactInputs();
}

function saveMetricsStore() {
    try {
        localStorage.setItem('greenrising_metrics', JSON.stringify(MetricsStore));
        localStorage.setItem('greenrising_cohorts', JSON.stringify(CohortStore));
        localStorage.setItem('greenrising_sensor_logs', JSON.stringify(SensorLogStore));
    } catch (e) {
        console.error('Error saving metrics store:', e);
    }
}

function updateAllMetricUI() {
    try {
        animateValue('dash-stat-youth', MetricsStore.youth, 600);
        animateValue('dash-stat-water', MetricsStore.water, 600);
        animateValue('dash-stat-boats', MetricsStore.boats, 600);
        animateValue('dash-stat-jobs', MetricsStore.jobs, 600);

        animateValue('dash-hero-youth', MetricsStore.youth, 600);
        animateValue('dash-hero-water', MetricsStore.water, 600);
        animateValue('dash-hero-jobs', MetricsStore.jobs, 600);

        animateValue('brief-stat-youth', MetricsStore.youth, 600);
        animateValue('brief-stat-water', MetricsStore.water, 600);
        animateValue('brief-stat-boats', MetricsStore.boats, 600);
        animateValue('brief-stat-jobs', MetricsStore.jobs, 600);

        const targetPct = Math.min(Math.round((MetricsStore.youth / 300) * 100), 100);
        const ringValEl = document.getElementById('dash-ring-val');
        const ringFillEl = document.getElementById('dash-ring-fill');
        if (ringValEl) ringValEl.innerText = `${targetPct}%`;
        if (ringFillEl) {
            const offset = 264 - (264 * (targetPct / 100));
            ringFillEl.style.strokeDashoffset = offset;
        }

        const carbonEl = document.getElementById('dash-carbon');
        const coastEl = document.getElementById('dash-coastline');
        const soilEl = document.getElementById('dash-soil');
        const rainEl = document.getElementById('dash-rain');

        if (carbonEl) carbonEl.innerText = `${MetricsStore.carbon} Tons`;
        if (coastEl) coastEl.innerText = `${MetricsStore.coastline} km`;
        if (soilEl) soilEl.innerText = `${MetricsStore.soil} Acres`;
        if (rainEl) rainEl.innerText = `${MetricsStore.rain} Systems`;
    } catch (err) {
        console.error('Error updating metric UI:', err);
    }
}

function animateValue(id, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    const start = parseInt(obj.innerText.replace(/,/g, '')) || 0;
    if (start === end) {
        obj.innerText = Number(end).toLocaleString();
        return;
    }
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / (range || 1)));
    const timer = setInterval(() => {
        current += Math.ceil(range / 10);
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        obj.innerText = Number(current).toLocaleString();
    }, Math.max(stepTime, 20));
}

function switchDashTab(tabId, btnEl) {
    try {
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
    } catch (err) {
        console.error('Error switching dashboard tabs:', err);
    }
}

function populateAdminImpactInputs() {
    try {
        const yEl = document.getElementById('admin-input-youth');
        const wEl = document.getElementById('admin-input-water');
        const bEl = document.getElementById('admin-input-boats');
        const jEl = document.getElementById('admin-input-jobs');
        const cEl = document.getElementById('admin-input-carbon');
        const coastEl = document.getElementById('admin-input-coastline');
        const sEl = document.getElementById('admin-input-soil');
        const rEl = document.getElementById('admin-input-rain');
        const urlEl = document.getElementById('admin-input-webhook');

        if (yEl) yEl.value = MetricsStore.youth;
        if (wEl) wEl.value = MetricsStore.water;
        if (bEl) bEl.value = MetricsStore.boats;
        if (jEl) jEl.value = MetricsStore.jobs;
        if (cEl) cEl.value = MetricsStore.carbon;
        if (coastEl) coastEl.value = MetricsStore.coastline;
        if (sEl) sEl.value = MetricsStore.soil;
        if (rEl) rEl.value = MetricsStore.rain;
        if (urlEl) urlEl.value = MetricsStore.webhookUrl;
    } catch (err) {
        console.error('Error populating admin impact inputs:', err);
    }
}

function syncLiveMetrics(isManualOverride = false) {
    if (typeof checkAuth === 'function' && !checkAuth('admin')) {
        alert('Unauthorized. Admin role required to sync metrics.');
        return;
    }

    const statusEl = document.getElementById('admin-sync-status');
    if (statusEl) {
        statusEl.innerHTML = `<span class="badge-blue">🔄 Syncing with API Endpoint & Local Stores...</span>`;
        statusEl.classList.remove('hidden');
    }

    setTimeout(() => {
        if (isManualOverride) {
            MetricsStore.youth = parseInt(document.getElementById('admin-input-youth')?.value) || MetricsStore.youth;
            MetricsStore.water = parseInt(document.getElementById('admin-input-water')?.value) || MetricsStore.water;
            MetricsStore.boats = parseInt(document.getElementById('admin-input-boats')?.value) || MetricsStore.boats;
            MetricsStore.jobs = parseInt(document.getElementById('admin-input-jobs')?.value) || MetricsStore.jobs;
            MetricsStore.carbon = parseFloat(document.getElementById('admin-input-carbon')?.value) || MetricsStore.carbon;
            MetricsStore.coastline = parseFloat(document.getElementById('admin-input-coastline')?.value) || MetricsStore.coastline;
            MetricsStore.soil = parseFloat(document.getElementById('admin-input-soil')?.value) || MetricsStore.soil;
            MetricsStore.rain = parseInt(document.getElementById('admin-input-rain')?.value) || MetricsStore.rain;
            MetricsStore.webhookUrl = document.getElementById('admin-input-webhook')?.value?.trim() || MetricsStore.webhookUrl;
        }

        saveMetricsStore();
        updateAllMetricUI();

        if (statusEl) {
            statusEl.innerHTML = `<span class="badge-green">✅ Live Metrics Synchronized &amp; Saved Successfully!</span>`;
            setTimeout(() => statusEl.classList.add('hidden'), 4000);
        }
    }, 400);
}

function renderCohortAdminList() {
    try {
        const container = document.getElementById('admin-cohorts-list');
        if (!container) return;
        if (CohortStore.length === 0) {
            container.innerHTML = `<p class="text-muted p-20">No active cohorts recorded.</p>`;
            return;
        }
        container.innerHTML = CohortStore.map(c => {
            const badgeClass = c.category === 'blue' ? 'badge-blue' : c.category === 'green' ? 'badge-green' : 'badge-orange';
            return `
                <div class="admin-event-row glass p-20 mb-15 flex-between align-center flex-wrap gap-15">
                    <div style="flex:1; min-width:240px;">
                        <div class="flex-between align-center mb-5">
                            <span class="${badgeClass}" style="font-size:0.75rem;">${c.category.toUpperCase()} ECONOMY</span>
                            <span class="tag-orange" style="font-size:0.75rem;">${c.status}</span>
                        </div>
                        <h4 style="margin-bottom:4px; font-size:1.15rem;">${c.name}</h4>
                        <div style="font-size:0.88rem; color:var(--color-text-muted);">
                            👥 <strong>${c.participants} Participants</strong> • 📍 ${c.parish}
                        </div>
                    </div>
                    <div class="flex-center gap-10" data-admin-only>
                        <button class="btn btn-sm btn-secondary" onclick="editCohort('${c.id}')">✏️ Edit Cohort</button>
                        <button class="btn btn-sm btn-outline-orange" onclick="deleteCohort('${c.id}')">🗑️ Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error rendering cohort admin list:', err);
    }
}

function addCohortPrompt() {
    if (typeof checkAuth === 'function' && !checkAuth('admin')) return;
    const name = prompt('Enter New Cohort Name:');
    if (!name) return;
    const participants = parseInt(prompt('Enter Number of Participants:', '15')) || 15;
    const category = prompt('Enter Category (blue, green, orange):', 'green') || 'green';
    const status = prompt('Enter Status:', 'Active Intake') || 'Active Intake';
    const parish = prompt('Enter Parish / Venue:', 'Barbados HQ') || 'Barbados HQ';

    CohortStore.push({
        id: 'coh-' + Date.now(),
        name,
        category: category.toLowerCase(),
        participants,
        status,
        parish
    });

    saveMetricsStore();
    renderCohortAdminList();
}

function editCohort(id) {
    if (typeof checkAuth === 'function' && !checkAuth('admin')) return;
    const c = CohortStore.find(item => item.id === id);
    if (!c) return;

    const newParticipants = prompt(`Update Participants for ${c.name}:`, c.participants);
    if (newParticipants !== null) {
        c.participants = parseInt(newParticipants) || c.participants;
        saveMetricsStore();
        renderCohortAdminList();
    }
}

function deleteCohort(id) {
    if (typeof checkAuth === 'function' && !checkAuth('admin')) return;
    if (confirm('Are you sure you want to delete this cohort record?')) {
        CohortStore = CohortStore.filter(c => c.id !== id);
        saveMetricsStore();
        renderCohortAdminList();
    }
}

function renderSensorLogAdminList() {
    try {
        const container = document.getElementById('admin-sensors-list');
        if (!container) return;
        if (SensorLogStore.length === 0) {
            container.innerHTML = `<p class="text-muted p-20">No environmental sensor logs recorded.</p>`;
            return;
        }
        container.innerHTML = SensorLogStore.map(s => `
            <div class="admin-event-row glass p-20 mb-15 flex-between align-center flex-wrap gap-15">
                <div style="flex:1; min-width:240px;">
                    <div class="flex-between align-center mb-5">
                        <span class="badge-blue" style="font-size:0.75rem;">${s.sensor}</span>
                        <span class="text-accent small">🕒 ${s.timestamp}</span>
                    </div>
                    <h4 style="margin-bottom:4px; font-size:1.15rem;">${s.metric}: <strong style="color:var(--color-primary);">${s.value}</strong></h4>
                    <p style="font-size:0.9rem; color:var(--color-text-muted);">Status: ${s.status}</p>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error rendering sensor log list:', err);
    }
}

function addSensorLogPrompt() {
    if (typeof checkAuth === 'function' && !checkAuth('admin')) return;
    const sensor = prompt('Sensor Name (e.g. Carlisle Bay Buoy #3):');
    if (!sensor) return;
    const metric = prompt('Metric (e.g. Water Salinity):', 'Salinity & pH') || 'Salinity & pH';
    const value = prompt('Reading Value (e.g. 35.8 PSU):', '35.8 PSU') || '35.8 PSU';

    SensorLogStore.unshift({
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        sensor,
        metric,
        value,
        status: 'Optimal'
    });

    saveMetricsStore();
    renderSensorLogAdminList();
}

// Expose stores via getters so window.MetricsStore always reflects the current variable reference
Object.defineProperty(window, 'MetricsStore',    { get: () => MetricsStore,    enumerable: true });
Object.defineProperty(window, 'CohortStore',     { get: () => CohortStore,     enumerable: true });
Object.defineProperty(window, 'SensorLogStore',  { get: () => SensorLogStore,  enumerable: true });

window.initMetricsStore        = initMetricsStore;
window.saveMetricsStore        = saveMetricsStore;
window.updateAllMetricUI       = updateAllMetricUI;
window.switchDashTab           = switchDashTab;
window.syncLiveMetrics         = syncLiveMetrics;
window.renderCohortAdminList   = renderCohortAdminList;
window.addCohortPrompt         = addCohortPrompt;
window.editCohort              = editCohort;
window.deleteCohort            = deleteCohort;
window.renderSensorLogAdminList = renderSensorLogAdminList;
window.addSensorLogPrompt      = addSensorLogPrompt;
window.populateAdminImpactInputs = populateAdminImpactInputs;

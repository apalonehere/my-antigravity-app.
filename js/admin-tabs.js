// --- Milestones, Cohorts & Sensor Logs Admin Module ---

// 1. DEFAULT DATA SETS WITH FALLBACK GUARDRAILS
const DEFAULT_MILESTONES = [
    {
        id: 'ms-2',
        title: '5 Parish Rainwater Monitoring Systems Online',
        date: 'June 2026',
        initiative: 'Water Conservation',
        description: 'Water conservation team completed installation of automated tank monitoring units in St. Lucy, St. Philip, and St. Thomas.'
    }
];

const DEFAULT_COHORTS = [
    {
        id: 'cohort-2',
        name: 'Eco-Explorers Cohort 2',
        targetAge: '10-13 years',
        status: 'Closed',
        activeCount: 25,
        details: 'Ecological literacy, recycling workshops, and outdoor nature exploration.'
    }
];

const DEFAULT_SENSOR_LOGS = [
    {
        id: 'sensor-1',
        location: 'Carlisle Bay Marine Probe #1',
        metric: '1.2 NTU (High Water Clarity)',
        date: '2026-07-28',
        notes: 'Optimal water quality recorded near reef restoration zone.'
    },
    {
        id: 'sensor-2',
        location: 'St. Michael Rainwater Tank Array',
        metric: 'PH 7.2 | 94% Capacity',
        date: '2026-07-29',
        notes: 'Rainfall collection active across community school storage.'
    },
    {
        id: 'sensor-3',
        location: 'Oistins Sargassum Bio-Remediation Plot',
        metric: '8.4 Acres Active Layer',
        date: '2026-07-30',
        notes: 'Soil organic carbon content increased by 14%.'
    }
];

// --- GETTERS & SETTERS (STORAGE WITH GUARDRAILS) ---
// Published content wins, then the shipped defaults. The old localStorage
// branch is gone: it changed what one browser saw and nothing else, which is
// not what "publish a milestone" should mean. Milestones are edited in the CMS
// at /admin, which commits content/milestones.json.
function getMilestones() {
    const published = window.GR_CONTENT && window.GR_CONTENT.milestones;
    if (published && Array.isArray(published.milestones)) {
        return published.milestones.map((m, i) => Object.assign({ id: 'ms-' + (i + 1) }, m));
    }
    return DEFAULT_MILESTONES;
}

// Called by js/content.js once milestones.json has loaded.
function renderMilestonesFromContent() {
    if (typeof renderPublicMilestones === 'function') renderPublicMilestones();
    if (typeof renderAdminMilestonesTable === 'function') renderAdminMilestonesTable();
}

function saveMilestones(arr) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('green_rising_milestones', JSON.stringify(arr));
    }
}

function getCohorts() {
    if (typeof localStorage === 'undefined') return DEFAULT_COHORTS;
    const stored = localStorage.getItem('green_rising_cohorts');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            console.error('Failed to parse cohorts from localStorage', e);
        }
    }
    return DEFAULT_COHORTS;
}

function saveCohorts(arr) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('green_rising_cohorts', JSON.stringify(arr));
    }
}

function getSensorLogs() {
    if (typeof localStorage === 'undefined') return DEFAULT_SENSOR_LOGS;
    const stored = localStorage.getItem('green_rising_sensor_logs');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            console.error('Failed to parse sensor logs from localStorage', e);
        }
    }
    return DEFAULT_SENSOR_LOGS;
}

function saveSensorLogs(arr) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('green_rising_sensor_logs', JSON.stringify(arr));
    }
}

// --- MILESTONES RENDER & FORMS ---
function renderAdminMilestonesTable() {
    const tbody = document.getElementById('admin-milestones-table-body');
    if (!tbody) return;
    const list = getMilestones();

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted p-20">No published milestones found.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => {
        const safeTitle = item.title || 'Untitled Milestone';
        const safeDate = item.date || 'TBD';
        const safeInit = item.initiative || 'General';
        const safeDesc = item.description || '';

        return `
            <tr>
                <td style="white-space: nowrap; font-size: 0.92rem;"><strong>${safeDate}</strong></td>
                <td>
                    <div style="font-weight: 700; font-size: 0.98rem; margin-bottom: 3px;">${safeTitle}</div>
                    <div style="font-size: 0.88rem; color: var(--color-text-muted); line-height: 1.4;">${safeDesc}</div>
                </td>
                <td style="white-space: nowrap;"><span class="tag-orange" style="white-space: nowrap;">${safeInit}</span></td>
                <td style="white-space: nowrap; text-align: right;">
                    <button class="btn-admin-action edit" onclick="editMilestoneItem('${item.id}')">Edit</button>
                    <button class="btn-admin-action delete" onclick="deleteMilestoneItem('${item.id}')">Delete</button>
                </td>
            </tr>`;
    }).join('');
}

function renderPublicMilestones() {
    const list = getMilestones();

    // 1. Impact Hub milestones timeline (#public-milestones-feed).
    //    The container is an <ol> in the new Impact Hub, so each entry is an
    //    <li>; the markup in index.html is only the pre-render fallback.
    const feedContainer = document.getElementById('public-milestones-feed');
    if (feedContainer) {
        if (!list || list.length === 0) {
            feedContainer.innerHTML = `<li class="text-muted p-20 text-center">No recent milestones recorded.</li>`;
        } else {
            feedContainer.innerHTML = list.map(item => `
                <li class="impact-milestone">
                    <span class="impact-milestone-date">${item.date || 'Recent'}</span>
                    <div class="impact-milestone-body">
                        <h4>${item.title || 'Milestone Update'}</h4>
                        <p>${item.description || item.summary || ''}</p>
                    </div>
                </li>`).join('');
        }
    }

}

function handleMilestoneSubmit(event) {
    if (event) event.preventDefault();
    const idInput = document.getElementById('milestone-id-input');
    const titleInput = document.getElementById('milestone-title-input');
    const dateInput = document.getElementById('milestone-date-input');
    const initiativeInput = document.getElementById('milestone-initiative-input');
    const descInput = document.getElementById('milestone-desc-input');

    const currentList = getMilestones();
    const existingId = idInput ? idInput.value : '';

    const newItem = {
        id: existingId || `ms-${Date.now()}`,
        title: titleInput ? titleInput.value.trim() : 'Milestone Update',
        date: dateInput ? dateInput.value.trim() : 'Recent',
        initiative: initiativeInput ? initiativeInput.value : 'General',
        description: descInput ? descInput.value.trim() : ''
    };

    if (existingId) {
        const idx = currentList.findIndex(x => x.id === existingId);
        if (idx !== -1) currentList[idx] = newItem;
        else currentList.unshift(newItem);
    } else {
        currentList.unshift(newItem);
    }

    saveMilestones(currentList);
    renderAdminMilestonesTable();
    renderPublicMilestones();
    resetMilestoneForm();

    const alertMsg = document.getElementById('admin-milestone-success-msg');
    if (alertMsg) {
        alertMsg.style.display = 'block';
        alertMsg.classList.remove('hidden');
        setTimeout(() => { alertMsg.style.display = 'none'; alertMsg.classList.add('hidden'); }, 3500);
    }
}

function editMilestoneItem(id) {
    const list = getMilestones();
    const item = list.find(x => x.id === id);
    if (!item) return;

    document.getElementById('milestone-id-input').value = item.id;
    document.getElementById('milestone-title-input').value = item.title || '';
    document.getElementById('milestone-date-input').value = item.date || '';
    document.getElementById('milestone-initiative-input').value = item.initiative || 'General';
    document.getElementById('milestone-desc-input').value = item.description || '';

    const heading = document.getElementById('milestone-form-heading');
    const btn = document.getElementById('milestone-submit-btn');
    if (heading) heading.innerText = 'Edit Milestone Entry';
    if (btn) btn.innerText = 'Update Milestone';
}

function deleteMilestoneItem(id) {
    if (!confirm('Delete this milestone entry?')) return;
    let list = getMilestones();
    list = list.filter(x => x.id !== id);
    saveMilestones(list);
    renderAdminMilestonesTable();
    renderPublicMilestones();
}

function resetMilestoneForm() {
    const form = document.getElementById('admin-milestone-form');
    if (form) form.reset();
    document.getElementById('milestone-id-input').value = '';
    const heading = document.getElementById('milestone-form-heading');
    const btn = document.getElementById('milestone-submit-btn');
    if (heading) heading.innerText = 'Publish New Milestone';
    if (btn) btn.innerText = 'Publish Milestone';
}

// --- COHORTS RENDER & FORMS ---
function renderAdminCohortsTable() {
    const tbody = document.getElementById('admin-cohorts-table-body');
    if (!tbody) return;
    const list = getCohorts();

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted p-20">No youth cohorts configured.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => {
        const safeName = item.name || 'Youth Cohort';
        const safeAge = item.targetAge || '16-29 years';
        const safeCount = item.activeCount || 0;
        const safeStatus = item.status || 'Open';

        return `
            <tr>
                <td style="font-weight: 700;">${safeName}</td>
                <td style="white-space: nowrap; font-size: 0.92rem; color: var(--color-text-muted);">${safeAge}</td>
                <td style="white-space: nowrap; font-weight: 700; color: var(--color-teal);">${safeCount} Youth</td>
                <td style="white-space: nowrap;">
                    <span class="cohort-badge ${safeStatus.toLowerCase() === 'open' ? 'open' : ''}" style="font-size: 0.78rem; white-space: nowrap;">
                        ${safeStatus === 'Open' ? 'Intake Active' : safeStatus}
                    </span>
                </td>
                <td style="white-space: nowrap; text-align: right;">
                    <button class="btn-admin-action edit" onclick="editCohortItem('${item.id}')">Edit</button>
                    <button class="btn-admin-action delete" onclick="deleteCohortItem('${item.id}')">Delete</button>
                </td>
            </tr>`;
    }).join('');
}

function handleCohortSubmit(event) {
    if (event) event.preventDefault();
    const idInput = document.getElementById('cohort-id-input');
    const nameInput = document.getElementById('cohort-name-input');
    const ageInput = document.getElementById('cohort-age-input');
    const statusInput = document.getElementById('cohort-status-input');
    const countInput = document.getElementById('cohort-count-input');
    const detailsInput = document.getElementById('cohort-details-input');

    const currentList = getCohorts();
    const existingId = idInput ? idInput.value : '';

    const newItem = {
        id: existingId || `cohort-${Date.now()}`,
        name: nameInput ? nameInput.value.trim() : 'Youth Cohort',
        targetAge: ageInput ? ageInput.value.trim() : '16-29 years',
        status: statusInput ? statusInput.value : 'Open',
        activeCount: countInput ? parseInt(countInput.value) || 10 : 10,
        details: detailsInput ? detailsInput.value.trim() : ''
    };

    if (existingId) {
        const idx = currentList.findIndex(x => x.id === existingId);
        if (idx !== -1) currentList[idx] = newItem;
        else currentList.unshift(newItem);
    } else {
        currentList.unshift(newItem);
    }

    saveCohorts(currentList);
    renderAdminCohortsTable();
    resetCohortForm();

    const alertMsg = document.getElementById('admin-cohort-success-msg');
    if (alertMsg) {
        alertMsg.style.display = 'block';
        alertMsg.classList.remove('hidden');
        setTimeout(() => { alertMsg.style.display = 'none'; alertMsg.classList.add('hidden'); }, 3500);
    }
}

function editCohortItem(id) {
    const list = getCohorts();
    const item = list.find(x => x.id === id);
    if (!item) return;

    document.getElementById('cohort-id-input').value = item.id;
    document.getElementById('cohort-name-input').value = item.name || '';
    document.getElementById('cohort-age-input').value = item.targetAge || '';
    document.getElementById('cohort-status-input').value = item.status || 'Open';
    document.getElementById('cohort-count-input').value = item.activeCount || 10;
    document.getElementById('cohort-details-input').value = item.details || '';

    const heading = document.getElementById('cohort-form-heading');
    const btn = document.getElementById('cohort-submit-btn');
    if (heading) heading.innerText = 'Edit Youth Cohort';
    if (btn) btn.innerText = 'Update Cohort';
}

function deleteCohortItem(id) {
    if (!confirm('Delete this cohort record?')) return;
    let list = getCohorts();
    list = list.filter(x => x.id !== id);
    saveCohorts(list);
    renderAdminCohortsTable();
}

function resetCohortForm() {
    const form = document.getElementById('admin-cohort-form');
    if (form) form.reset();
    document.getElementById('cohort-id-input').value = '';
    const heading = document.getElementById('cohort-form-heading');
    const btn = document.getElementById('cohort-submit-btn');
    if (heading) heading.innerText = 'Configure Youth Cohort';
    if (btn) btn.innerText = 'Save Cohort Status';
}

// --- SENSOR LOGS RENDER & FORMS ---
function renderAdminSensorLogsTable() {
    const tbody = document.getElementById('admin-sensor-table-body');
    if (!tbody) return;
    const list = getSensorLogs();

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted p-20">No environmental sensor logs recorded.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => {
        const safeLocation = item.location || 'Barbados Probe';
        const safeMetric = item.metric || 'Normal';
        const safeDate = item.date || 'TBD';
        const safeNotes = item.notes || '-';

        return `
            <tr>
                <td style="white-space: nowrap; font-size: 0.92rem;"><strong>${safeDate}</strong></td>
                <td style="font-weight: 700; font-size: 0.95rem;">📍 ${safeLocation}</td>
                <td style="white-space: nowrap; font-weight: 700; color: var(--color-teal);">${safeMetric}</td>
                <td style="font-size: 0.88rem; color: var(--color-text-muted);">${safeNotes}</td>
                <td style="white-space: nowrap; text-align: right;">
                    <button class="btn-admin-action delete" onclick="deleteSensorLog('${item.id}')">Delete</button>
                </td>
            </tr>`;
    }).join('');
}

function handleSensorLogSubmit(event) {
    if (event) event.preventDefault();
    const locInput = document.getElementById('sensor-location-input');
    const metricInput = document.getElementById('sensor-metric-input');
    const dateInput = document.getElementById('sensor-date-input');
    const notesInput = document.getElementById('sensor-notes-input');

    const currentList = getSensorLogs();

    const newLog = {
        id: `sensor-${Date.now()}`,
        location: locInput ? locInput.value.trim() : 'Barbados Probe',
        metric: metricInput ? metricInput.value.trim() : 'Normal',
        date: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
        notes: notesInput ? notesInput.value.trim() : ''
    };

    currentList.unshift(newLog);
    saveSensorLogs(currentList);

    renderAdminSensorLogsTable();

    const form = document.getElementById('admin-sensor-form');
    if (form) form.reset();

    const alertMsg = document.getElementById('admin-sensor-success-msg');
    if (alertMsg) {
        alertMsg.style.display = 'block';
        alertMsg.classList.remove('hidden');
        setTimeout(() => { alertMsg.style.display = 'none'; alertMsg.classList.add('hidden'); }, 3500);
    }
}

function deleteSensorLog(id) {
    if (!confirm('Delete this sensor reading log?')) return;
    let list = getSensorLogs();
    list = list.filter(x => x.id !== id);
    saveSensorLogs(list);
    renderAdminSensorLogsTable();
}

// --- INIT ALL TAB MODULES ---
function initAdminTabsModules() {
    renderAdminMilestonesTable();
    renderPublicMilestones();

    renderAdminCohortsTable();

    renderAdminSensorLogsTable();
}

document.addEventListener('DOMContentLoaded', () => {
    initAdminTabsModules();
});

window.renderMilestonesFromContent = renderMilestonesFromContent;

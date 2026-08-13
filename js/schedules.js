// --- Schedules & Events Module ---

const DEFAULT_SCHEDULES = [
    {
        id: 'sched-1',
        title: 'Youth Water Audit Workshop',
        category: 'workshop',
        economy: 'blue',
        date: '2026-08-15',
        startTime: '09:00',
        endTime: '12:00',
        location: 'Bridgetown Port & Maritime Center',
        description: 'Hands-on water audit training for youth leaders across St. Michael parish.'
    },
    {
        id: 'sched-2',
        title: 'Sargassum Bio-Remediation Field Trial',
        category: 'environmental',
        economy: 'green',
        date: '2026-08-22',
        startTime: '10:00',
        endTime: '14:00',
        location: 'Future Barbados Innovation Hub',
        description: 'Community soil bio-remediation testing using organic compost extracts.'
    },
    {
        id: 'sched-3',
        title: 'Pinelands Orange Economy Expo',
        category: 'workshop',
        economy: 'orange',
        date: '2026-09-05',
        startTime: '13:00',
        endTime: '17:00',
        location: 'Pinelands Community Center',
        description: 'Showcasing youth creative technology, digital media, and sustainable design.'
    }
];

function getSchedules() {
    if (typeof localStorage === 'undefined') return DEFAULT_SCHEDULES;
    const stored = localStorage.getItem('green_rising_schedules');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            console.error('Failed to parse schedules from localStorage', e);
        }
    }
    return DEFAULT_SCHEDULES;
}

function saveSchedules(schedulesArray) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('green_rising_schedules', JSON.stringify(schedulesArray));
    }
}

function toggleCustomVenueInput(selectEl) {
    const customGroup = document.getElementById('sched-custom-location-group');
    if (customGroup) {
        if (selectEl.value === 'custom') {
            customGroup.style.display = 'block';
        } else {
            customGroup.style.display = 'none';
        }
    }
}

function renderAdminSchedulesTable() {
    const tbody = document.getElementById('admin-schedules-table-body');
    const badge = document.getElementById('sched-count-badge');
    if (!tbody) return;

    const list = getSchedules();
    if (badge) badge.innerText = `${list.length} Event${list.length === 1 ? '' : 's'}`;

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="padding: 24px; text-align: center; color: var(--color-text-muted);">
                    No scheduled events found. Use the form above to add a new event.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => {
        const safeTitle = item.title || 'Untitled Event';
        const safeCategory = (item.category || 'workshop').toUpperCase();
        const safeEconomy = (item.economy || 'cross').toUpperCase();
        const safeDate = item.date || 'TBD';
        const safeStart = item.startTime || '';
        const safeEnd = item.endTime || '';
        const safeLocation = item.location || 'Barbados';

        const timeStr = safeStart && safeEnd ? `${safeStart} - ${safeEnd}` : safeStart || '';

        return `
            <tr style="border-bottom: 1px solid rgba(5,150,105,0.12);">
                <td style="padding: 14px 8px; font-size: 0.95rem;">
                    <strong>${safeDate}</strong>
                    ${timeStr ? `<div style="font-size: 0.82rem; color: var(--color-text-muted);">${timeStr}</div>` : ''}
                </td>
                <td style="padding: 14px 8px;">
                    <div style="font-weight: 700; font-size: 1rem; color: var(--color-text-bright);">${safeTitle}</div>
                    <span class="tag-orange" style="font-size: 0.72rem; display: inline-block; margin-top: 4px;">${safeCategory}</span>
                </td>
                <td style="padding: 14px 8px;">
                    <span class="badge-orange" style="font-size: 0.75rem;">${safeEconomy}</span>
                </td>
                <td style="padding: 14px 8px; font-size: 0.92rem; color: var(--color-text-muted);">
                    📍 ${safeLocation}
                </td>
                <td style="padding: 14px 8px; text-align: right;">
                    <button class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.8rem; margin-right: 4px;" onclick="editScheduleEvent('${item.id}')">Edit</button>
                    <button class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.8rem; border-color: #ef4444; color: #ef4444;" onclick="deleteScheduleEvent('${item.id}')">Delete</button>
                </td>
            </tr>`;
    }).join('');
}

function renderPublicSchedulesGrid() {
    const grid = document.getElementById('public-schedules-grid');
    if (!grid) return;

    const list = getSchedules();
    if (list.length === 0) {
        grid.innerHTML = `
            <div class="glass p-25 text-center text-muted" style="grid-column: 1 / -1;">
                No upcoming events currently scheduled. Check back soon!
            </div>`;
        return;
    }

    grid.innerHTML = list.map(item => {
        const safeTitle = item.title || 'Untitled Event';
        const safeCategory = (item.category || 'Workshop').toUpperCase();
        const safeDate = item.date || 'TBD';
        const safeStart = item.startTime || '';
        const safeEnd = item.endTime || '';
        const safeLocation = item.location || 'Barbados';
        const safeDesc = item.description || 'No description available for this event.';
        const safeEcon = (item.economy || 'cross').toLowerCase();

        let econClass = 'badge-blue';
        if (safeEcon === 'green') econClass = 'badge-green';
        if (safeEcon === 'orange') econClass = 'badge-orange-tag';

        const timeStr = safeStart && safeEnd ? `${safeStart} - ${safeEnd}` : safeStart;

        return `
            <div class="workshop-card glass">
                <div class="workshop-header mb-10">
                    <span class="workshop-date">📅 ${safeDate} ${timeStr ? `(${timeStr})` : ''}</span>
                    <span class="economy-badge ${econClass}">${safeEcon}</span>
                </div>
                <div>
                    <span class="category-tag mb-5" style="font-size: 0.72rem;">${safeCategory}</span>
                    <h4 style="font-size: 1.2rem; margin-bottom: 8px;">${safeTitle}</h4>
                    <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-bottom: 12px;">${safeDesc}</p>
                </div>
                <div style="font-size: 0.88rem; font-weight: 600; color: var(--color-teal); border-top: 1px solid rgba(5,150,105,0.12); padding-top: 10px;">
                    📍 ${safeLocation}
                </div>
            </div>`;
    }).join('');
}

function handleScheduleSubmit(event) {
    if (event) event.preventDefault();

    const idInput = document.getElementById('sched-id-input');
    const titleInput = document.getElementById('sched-title-input');
    const categoryInput = document.getElementById('sched-category-input');
    const economyInput = document.getElementById('sched-economy-input');
    const dateInput = document.getElementById('sched-date-input');
    const startTimeInput = document.getElementById('sched-start-time-input');
    const endTimeInput = document.getElementById('sched-end-time-input');
    const locationSelect = document.getElementById('sched-location-select');
    const locationCustom = document.getElementById('sched-location-custom');
    const descInput = document.getElementById('sched-description-input');

    let finalLocation = locationSelect ? locationSelect.value : 'Barbados';
    if (finalLocation === 'custom' && locationCustom && locationCustom.value.trim()) {
        finalLocation = locationCustom.value.trim();
    }

    const currentList = getSchedules();
    const existingId = idInput ? idInput.value : '';

    const newEvent = {
        id: existingId || `sched-${Date.now()}`,
        title: titleInput ? titleInput.value.trim() : 'New Event',
        category: categoryInput ? categoryInput.value : 'workshop',
        economy: economyInput ? economyInput.value : 'cross',
        date: dateInput ? dateInput.value : '',
        startTime: startTimeInput ? startTimeInput.value : '',
        endTime: endTimeInput ? endTimeInput.value : '',
        location: finalLocation,
        description: descInput ? descInput.value.trim() : ''
    };

    if (existingId) {
        const index = currentList.findIndex(x => x.id === existingId);
        if (index !== -1) {
            currentList[index] = newEvent;
        } else {
            currentList.unshift(newEvent);
        }
    } else {
        currentList.unshift(newEvent);
    }

    saveSchedules(currentList);
    renderAdminSchedulesTable();
    renderPublicSchedulesGrid();
    resetScheduleForm();

    const alertBox = document.getElementById('admin-sched-success-msg');
    if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.classList.remove('hidden');
        setTimeout(() => {
            alertBox.style.display = 'none';
            alertBox.classList.add('hidden');
        }, 3500);
    }
}

function editScheduleEvent(eventId) {
    const list = getSchedules();
    const item = list.find(x => x.id === eventId);
    if (!item) return;

    document.getElementById('sched-id-input').value = item.id;
    document.getElementById('sched-title-input').value = item.title || '';
    document.getElementById('sched-category-input').value = item.category || 'workshop';
    document.getElementById('sched-economy-input').value = item.economy || 'cross';
    document.getElementById('sched-date-input').value = item.date || '';
    document.getElementById('sched-start-time-input').value = item.startTime || '';
    document.getElementById('sched-end-time-input').value = item.endTime || '';
    document.getElementById('sched-description-input').value = item.description || '';

    const selectEl = document.getElementById('sched-location-select');
    const customGroup = document.getElementById('sched-custom-location-group');
    const customInput = document.getElementById('sched-location-custom');

    const knownVenues = [
        'Bridgetown Port & Maritime Center',
        'Future Barbados Innovation Hub',
        'Pinelands Community Center',
        'UWI Cave Hill Campus'
    ];

    if (knownVenues.includes(item.location)) {
        if (selectEl) selectEl.value = item.location;
        if (customGroup) customGroup.style.display = 'none';
    } else {
        if (selectEl) selectEl.value = 'custom';
        if (customGroup) customGroup.style.display = 'block';
        if (customInput) customInput.value = item.location || '';
    }

    const heading = document.getElementById('sched-form-heading');
    const submitBtn = document.getElementById('sched-submit-btn');
    const cancelBtn = document.getElementById('sched-cancel-btn');

    if (heading) heading.innerText = 'Edit Schedule Event';
    if (submitBtn) submitBtn.innerText = 'Update Schedule Event';
    if (cancelBtn) {
        cancelBtn.style.display = 'inline-block';
        cancelBtn.classList.remove('hidden');
    }

    window.scrollTo({ top: document.getElementById('admin-tab-schedules').offsetTop - 80, behavior: 'smooth' });
}

function deleteScheduleEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event schedule?')) return;
    let list = getSchedules();
    list = list.filter(x => x.id !== eventId);
    saveSchedules(list);
    renderAdminSchedulesTable();
    renderPublicSchedulesGrid();
}

function resetScheduleForm() {
    const form = document.getElementById('admin-schedule-form');
    if (form) form.reset();
    document.getElementById('sched-id-input').value = '';

    const customGroup = document.getElementById('sched-custom-location-group');
    if (customGroup) customGroup.style.display = 'none';

    const heading = document.getElementById('sched-form-heading');
    const submitBtn = document.getElementById('sched-submit-btn');
    const cancelBtn = document.getElementById('sched-cancel-btn');

    if (heading) heading.innerText = 'Schedule New Event';
    if (submitBtn) submitBtn.innerText = 'Save Schedule Event';
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
        cancelBtn.classList.add('hidden');
    }
}

function initSchedulesModule() {
    renderAdminSchedulesTable();
    renderPublicSchedulesGrid();
}

document.addEventListener('DOMContentLoaded', () => {
    initSchedulesModule();
});

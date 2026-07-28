// Green Rising Barbados — Event & Schedule CRUD Manager Module

const defaultEvents = [
    {
        id: 'evt-1',
        category: 'environmental', // 'environmental' | 'milestones' | 'workshop'
        title: 'Carlisle Bay Reef & Water Quality Sampling',
        date: '2026-08-05',
        time: '08:30 AM',
        location: 'Carlisle Bay Marine Reserve, St. Michael',
        status: 'Scheduled',
        description: 'Youth environmental teams collect salinity, temperature, and turbidity samples along the coastal reef.',
        badge: 'Water Conservation'
    },
    {
        id: 'evt-2',
        category: 'environmental',
        title: 'Holetown Aquifer & Groundwater Check',
        date: '2026-08-12',
        time: '10:00 AM',
        location: 'Holetown Catchment Zone, St. James',
        status: 'Scheduled',
        description: 'Groundwater monitoring checks and community rain-barrel inspection checks with CYEN youth ambassadors.',
        badge: 'Groundwater Tech'
    },
    {
        id: 'evt-3',
        category: 'milestones',
        title: 'Cohort 3 YOTS Vessel Assembly & Hull Testing',
        date: '2026-08-20',
        time: '09:00 AM',
        location: 'Barbados Coast Guard Base, Bridgetown',
        status: 'Upcoming Milestone',
        description: '10 youth builders complete final hull pressure testing on eco-composite ocean rescue craft.',
        badge: 'YOTS Maritime'
    },
    {
        id: 'evt-4',
        category: 'milestones',
        title: 'Pinelands Creative Pavilion Grand Showcase',
        date: '2026-09-02',
        time: '04:00 PM',
        location: 'Pinelands Cultural Center, St. Michael',
        status: 'Upcoming Event',
        description: 'Live presentation of student digital media projects, sustainable fashion, and renewable energy models.',
        badge: 'Orange Economy'
    }
];

let EventStore = [];

function initEventStore() {
    const stored = localStorage.getItem('greenrising_events');
    if (stored) {
        try {
            EventStore = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading events from storage, resetting defaults', e);
            EventStore = [...defaultEvents];
            saveEventStore();
        }
    } else {
        EventStore = [...defaultEvents];
        saveEventStore();
    }

    renderPublicSchedules();
    renderAdminScheduleManager();
}

function saveEventStore() {
    localStorage.setItem('greenrising_events', JSON.stringify(EventStore));
}

function addEvent(eventData) {
    const newEvent = {
        id: 'evt-' + Date.now(),
        category: eventData.category || 'environmental',
        title: eventData.title || 'Untitled Event',
        date: eventData.date || new Date().toISOString().split('T')[0],
        time: eventData.time || '10:00 AM',
        location: eventData.location || 'Barbados Youth Center',
        status: eventData.status || 'Scheduled',
        description: eventData.description || '',
        badge: eventData.badge || 'Environmental'
    };

    EventStore.unshift(newEvent);
    saveEventStore();
    renderPublicSchedules();
    renderAdminScheduleManager();
    return newEvent;
}

function updateEvent(id, updatedFields) {
    const idx = EventStore.findIndex(e => e.id === id);
    if (idx !== -1) {
        EventStore[idx] = { ...EventStore[idx], ...updatedFields };
        saveEventStore();
        renderPublicSchedules();
        renderAdminScheduleManager();
        return EventStore[idx];
    }
    return null;
}

function deleteEvent(id) {
    const idx = EventStore.findIndex(e => e.id === id);
    if (idx !== -1) {
        EventStore.splice(idx, 1);
        saveEventStore();
        renderPublicSchedules();
        renderAdminScheduleManager();
        return true;
    }
    return false;
}

function renderPublicSchedules() {
    // Render Environmental Monitoring Public Schedule
    const envContainer = document.getElementById('public-environmental-schedule');
    if (envContainer) {
        const envEvents = EventStore.filter(e => e.category === 'environmental');
        if (envEvents.length === 0) {
            envContainer.innerHTML = `<div class="fact-box"><p>No upcoming environmental monitoring sessions scheduled.</p></div>`;
        } else {
            envContainer.innerHTML = envEvents.map(evt => `
                <div class="schedule-card glass p-25 mb-20" id="public-card-${evt.id}">
                    <div class="flex-between align-center mb-10 flex-wrap gap-10">
                        <span class="badge-orange">${escapeHtml(evt.badge)}</span>
                        <span class="text-accent" style="font-weight:700; font-size:0.9rem;">📅 ${escapeHtml(evt.date)} at ${escapeHtml(evt.time)}</span>
                    </div>
                    <h4 style="font-size:1.25rem; margin-bottom:8px; color:var(--color-text-bright);">${escapeHtml(evt.title)}</h4>
                    <p style="font-size:1rem; margin-bottom:12px; color:var(--color-text-muted);">${escapeHtml(evt.description)}</p>
                    <div class="flex-between align-center text-muted" style="font-size:0.88rem;">
                        <span>📍 ${escapeHtml(evt.location)}</span>
                        <span class="tag-orange" style="font-size:0.78rem;">${escapeHtml(evt.status)}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // Render Public Milestones Timeline
    const milestonesContainer = document.getElementById('public-milestones-timeline');
    if (milestonesContainer) {
        const milestoneEvents = EventStore.filter(e => e.category === 'milestones');
        if (milestoneEvents.length === 0) {
            milestonesContainer.innerHTML = `<p class="text-muted">No upcoming milestones published.</p>`;
        } else {
            milestonesContainer.innerHTML = milestoneEvents.map((evt, idx) => `
                <li id="public-milestone-${evt.id}">
                    <div class="timeline-step">${idx + 1}</div>
                    <div class="flex-between align-center flex-wrap gap-10">
                        <strong>${escapeHtml(evt.title)}</strong>
                        <span class="cohort-badge open">${escapeHtml(evt.date)}</span>
                    </div>
                    <p>${escapeHtml(evt.description)}</p>
                    <div class="mt-10" style="font-size:0.85rem; color:var(--color-teal); font-weight:600;">
                        📍 ${escapeHtml(evt.location)} • Status: ${escapeHtml(evt.status)}
                    </div>
                </li>
            `).join('');
        }
    }
}

function renderAdminScheduleManager() {
    // Only render admin components if authorized
    const envAdminList = document.getElementById('admin-environmental-list');
    if (envAdminList) {
        const envEvents = EventStore.filter(e => e.category === 'environmental');
        if (envEvents.length === 0) {
            envAdminList.innerHTML = `<p class="text-muted p-20">No environmental events found.</p>`;
        } else {
            envAdminList.innerHTML = envEvents.map(evt => `
                <div class="admin-event-row glass p-20 mb-15 flex-between align-center flex-wrap gap-15">
                    <div style="flex:1; min-width:240px;">
                        <div class="flex-between align-center mb-5">
                            <span class="badge-orange" style="font-size:0.75rem;">${escapeHtml(evt.badge)}</span>
                            <span class="text-muted small">ID: ${evt.id}</span>
                        </div>
                        <h4 style="margin-bottom:4px; font-size:1.15rem;">${escapeHtml(evt.title)}</h4>
                        <p style="font-size:0.95rem; margin-bottom:6px; color:var(--color-text-muted);">${escapeHtml(evt.description)}</p>
                        <div style="font-size:0.85rem; color:var(--color-teal);">
                            📅 ${escapeHtml(evt.date)} (${escapeHtml(evt.time)}) • 📍 ${escapeHtml(evt.location)}
                        </div>
                    </div>
                    <div class="flex-center gap-10" data-admin-only>
                        <button class="btn btn-sm btn-secondary" onclick="openEditEventModal('${evt.id}')">✏️ Edit</button>
                        <button class="btn btn-sm btn-outline-orange" onclick="handleDeleteEvent('${evt.id}')">🗑️ Delete</button>
                    </div>
                </div>
            `).join('');
        }
    }

    const milestoneAdminList = document.getElementById('admin-milestone-list');
    if (milestoneAdminList) {
        const milestoneEvents = EventStore.filter(e => e.category === 'milestones');
        if (milestoneEvents.length === 0) {
            milestoneAdminList.innerHTML = `<p class="text-muted p-20">No milestone events found.</p>`;
        } else {
            milestoneAdminList.innerHTML = milestoneEvents.map(evt => `
                <div class="admin-event-row glass p-20 mb-15 flex-between align-center flex-wrap gap-15">
                    <div style="flex:1; min-width:240px;">
                        <div class="flex-between align-center mb-5">
                            <span class="cohort-badge open" style="font-size:0.75rem;">${escapeHtml(evt.badge)}</span>
                            <span class="text-muted small">ID: ${evt.id}</span>
                        </div>
                        <h4 style="margin-bottom:4px; font-size:1.15rem;">${escapeHtml(evt.title)}</h4>
                        <p style="font-size:0.95rem; margin-bottom:6px; color:var(--color-text-muted);">${escapeHtml(evt.description)}</p>
                        <div style="font-size:0.85rem; color:var(--color-teal);">
                            📅 ${escapeHtml(evt.date)} (${escapeHtml(evt.time)}) • 📍 ${escapeHtml(evt.location)}
                        </div>
                    </div>
                    <div class="flex-center gap-10" data-admin-only>
                        <button class="btn btn-sm btn-secondary" onclick="openEditEventModal('${evt.id}')">✏️ Edit</button>
                        <button class="btn btn-sm btn-outline-orange" onclick="handleDeleteEvent('${evt.id}')">🗑️ Delete</button>
                    </div>
                </div>
            `).join('');
        }
    }

}

function handleDeleteEvent(id) {
    if (!checkAuth('admin')) {
        alert('Unauthorized action. Admin role required.');
        return;
    }
    if (confirm('Are you sure you want to delete this event schedule?')) {
        deleteEvent(id);
    }
}

function openCreateEventModal(defaultCategory = 'environmental') {
    if (!checkAuth('admin')) {
        alert('Unauthorized. Please log in as Admin first.');
        return;
    }

    const modal = document.getElementById('event-editor-modal');
    if (!modal) return;

    document.getElementById('event-modal-title').textContent = 'Create New Event Schedule';
    document.getElementById('event-form-id').value = '';
    document.getElementById('event-form-category').value = defaultCategory;
    document.getElementById('event-form-title').value = '';
    document.getElementById('event-form-badge').value = defaultCategory === 'environmental' ? 'Water Conservation' : 'Milestone';
    document.getElementById('event-form-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('event-form-time').value = '09:00 AM';
    document.getElementById('event-form-location').value = 'Barbados Youth Engine HQ';
    document.getElementById('event-form-status').value = 'Scheduled';
    document.getElementById('event-form-description').value = '';

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function openEditEventModal(id) {
    if (!checkAuth('admin')) {
        alert('Unauthorized. Please log in as Admin first.');
        return;
    }

    const evt = EventStore.find(e => e.id === id);
    if (!evt) return;

    const modal = document.getElementById('event-editor-modal');
    if (!modal) return;

    document.getElementById('event-modal-title').textContent = 'Edit Event Schedule';
    document.getElementById('event-form-id').value = evt.id;
    document.getElementById('event-form-category').value = evt.category;
    document.getElementById('event-form-title').value = evt.title;
    document.getElementById('event-form-badge').value = evt.badge;
    document.getElementById('event-form-date').value = evt.date;
    document.getElementById('event-form-time').value = evt.time;
    document.getElementById('event-form-location').value = evt.location;
    document.getElementById('event-form-status').value = evt.status;
    document.getElementById('event-form-description').value = evt.description;

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeEventModal() {
    const modal = document.getElementById('event-editor-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function handleSaveEvent(e) {
    if (e) e.preventDefault();
    if (!checkAuth('admin')) {
        alert('Unauthorized.');
        return;
    }

    const id = document.getElementById('event-form-id').value;
    const category = document.getElementById('event-form-category').value;
    const title = document.getElementById('event-form-title').value;
    const badge = document.getElementById('event-form-badge').value;
    const date = document.getElementById('event-form-date').value;
    const time = document.getElementById('event-form-time').value;
    const location = document.getElementById('event-form-location').value;
    const status = document.getElementById('event-form-status').value;
    const description = document.getElementById('event-form-description').value;

    if (!title) {
        alert('Please enter an event title');
        return;
    }

    if (id) {
        updateEvent(id, { category, title, badge, date, time, location, status, description });
    } else {
        addEvent({ category, title, badge, date, time, location, status, description });
    }

    closeEventModal();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

window.EventStore = EventStore;
window.initEventStore = initEventStore;
window.addEvent = addEvent;
window.updateEvent = updateEvent;
window.deleteEvent = deleteEvent;
window.renderPublicSchedules = renderPublicSchedules;
window.renderAdminScheduleManager = renderAdminScheduleManager;
window.handleDeleteEvent = handleDeleteEvent;
window.openCreateEventModal = openCreateEventModal;
window.openEditEventModal = openEditEventModal;
window.closeEventModal = closeEventModal;
window.handleSaveEvent = handleSaveEvent;

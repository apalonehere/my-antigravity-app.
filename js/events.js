// Green Rising Barbados - Event & Schedule CRUD Manager Module with Defensive Guards & Error Recovery

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
        description: 'Groundwater monitoring checks and community rain-barrel inspection checks with youth ambassadors.',
        badge: 'Groundwater Tech'
    }
];

let EventStore = [];

/**
 * Defensive Event Sanitizer
 * Ensures every event object has valid fallback strings for all fields
 */
function sanitizeEvent(evt) {
    if (!evt || typeof evt !== 'object') return null;
    return {
        id: String(evt.id || 'evt-' + Date.now()),
        category: String(evt.category || 'environmental').trim(),
        title: String(evt.title || 'Untitled Event').trim(),
        date: String(evt.date || new Date().toISOString().split('T')[0]).trim(),
        time: String(evt.time || '09:00 AM').trim(),
        location: String(evt.location || 'Barbados Youth Engine HQ').trim(),
        status: String(evt.status || 'Scheduled').trim(),
        description: String(evt.description || '').trim(),
        badge: String(evt.badge || 'Environmental').trim()
    };
}

function initEventStore() {
    try {
        const stored = localStorage.getItem('greenrising_events');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    EventStore = parsed.map(sanitizeEvent).filter(Boolean);
                } else {
                    EventStore = defaultEvents.map(sanitizeEvent).filter(Boolean);
                    saveEventStore();
                }
            } catch (e) {
                console.error('Error parsing stored events JSON, resetting defaults:', e);
                EventStore = defaultEvents.map(sanitizeEvent).filter(Boolean);
                saveEventStore();
            }
        } else {
            EventStore = defaultEvents.map(sanitizeEvent).filter(Boolean);
            saveEventStore();
        }
    } catch (err) {
        console.error('Failed to initialize EventStore:', err);
        EventStore = defaultEvents.map(sanitizeEvent).filter(Boolean);
    }

    renderPublicSchedules();
    renderAdminScheduleManager();
}

function saveEventStore() {
    try {
        localStorage.setItem('greenrising_events', JSON.stringify(EventStore));
    } catch (e) {
        console.error('Error saving events to localStorage:', e);
    }
}

function addEvent(eventData) {
    try {
        const newEvent = sanitizeEvent({
            id: 'evt-' + Date.now(),
            category: eventData.category || 'environmental',
            title: eventData.title || 'Untitled Event',
            date: eventData.date || new Date().toISOString().split('T')[0],
            time: eventData.time || '09:00 AM',
            location: eventData.location || 'Barbados Youth Engine HQ',
            status: eventData.status || 'Scheduled',
            description: eventData.description || '',
            badge: eventData.badge || 'Environmental'
        });

        if (newEvent) {
            EventStore.unshift(newEvent);
            saveEventStore();
            renderPublicSchedules();
            renderAdminScheduleManager();
            return newEvent;
        }
    } catch (err) {
        console.error('Error in addEvent:', err);
    }
    return null;
}

function updateEvent(id, updatedFields) {
    try {
        const idx = EventStore.findIndex(e => e && e.id === id);
        if (idx !== -1) {
            const merged = { ...EventStore[idx], ...updatedFields, id };
            const sanitized = sanitizeEvent(merged);
            if (sanitized) {
                EventStore[idx] = sanitized;
                saveEventStore();
                renderPublicSchedules();
                renderAdminScheduleManager();
                return EventStore[idx];
            }
        }
    } catch (err) {
        console.error('Error in updateEvent:', err);
    }
    return null;
}

function deleteEvent(id) {
    try {
        const idx = EventStore.findIndex(e => e && e.id === id);
        if (idx !== -1) {
            EventStore.splice(idx, 1);
            saveEventStore();
            renderPublicSchedules();
            renderAdminScheduleManager();
            return true;
        }
    } catch (err) {
        console.error('Error in deleteEvent:', err);
    }
    return false;
}

function renderPublicSchedules() {
    // Environmental Monitoring Public Schedule Error Boundary
    try {
        const envContainer = document.getElementById('public-environmental-schedule');
        if (envContainer) {
            const envEvents = (Array.isArray(EventStore) ? EventStore : [])
                .filter(e => e && e.category === 'environmental');
            if (envEvents.length === 0) {
                envContainer.innerHTML = `<div class="fact-box"><p>No upcoming environmental monitoring sessions scheduled.</p></div>`;
            } else {
                envContainer.innerHTML = envEvents.map(evt => {
                    const safeId = escapeHtml(evt.id || 'evt-unknown');
                    const safeBadge = escapeHtml(evt.badge || 'Water Conservation');
                    const safeDate = escapeHtml(evt.date || 'TBD');
                    const safeTime = escapeHtml(evt.time || '09:00 AM');
                    const safeTitle = escapeHtml(evt.title || 'Untitled Event');
                    const safeDesc = escapeHtml(evt.description || '');
                    const safeLoc = escapeHtml(evt.location || 'Barbados Marine Reserve');
                    const safeStatus = escapeHtml(evt.status || 'Scheduled');

                    return `
                        <div class="schedule-card glass p-25 mb-20" id="public-card-${safeId}">
                            <div class="flex-between align-center mb-10 flex-wrap gap-10">
                                <span class="badge-orange">${safeBadge}</span>
                                <span class="text-accent" style="font-weight:700; font-size:0.9rem;">📅 ${safeDate} at ${safeTime}</span>
                            </div>
                            <h4 style="font-size:1.25rem; margin-bottom:8px; color:var(--color-text-bright);">${safeTitle}</h4>
                            <p style="font-size:1rem; margin-bottom:12px; color:var(--color-text-muted);">${safeDesc}</p>
                            <div class="flex-between align-center text-muted" style="font-size:0.88rem;">
                                <span>📍 ${safeLoc}</span>
                                <span class="tag-orange" style="font-size:0.78rem;">${safeStatus}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    } catch (err) {
        console.error('Error rendering public environmental schedule component:', err);
        const envContainer = document.getElementById('public-environmental-schedule');
        if (envContainer) {
            envContainer.innerHTML = `<div class="fact-box"><p>Schedule currently updating...</p></div>`;
        }
    }

    // Public Milestones Timeline Error Boundary
    try {
        const milestonesContainer = document.getElementById('public-milestones-timeline');
        if (milestonesContainer) {
            const milestoneEvents = (Array.isArray(EventStore) ? EventStore : [])
                .filter(e => e && e.category === 'milestones');
            if (milestoneEvents.length === 0) {
                milestonesContainer.innerHTML = `<p class="text-muted">No upcoming milestones published.</p>`;
            } else {
                milestonesContainer.innerHTML = milestoneEvents.map((evt, idx) => {
                    const safeId = escapeHtml(evt.id || 'evt-unknown');
                    const safeTitle = escapeHtml(evt.title || 'Untitled Milestone');
                    const safeDate = escapeHtml(evt.date || 'TBD');
                    const safeDesc = escapeHtml(evt.description || '');
                    const safeLoc = escapeHtml(evt.location || 'Barbados Coast Guard Base');
                    const safeStatus = escapeHtml(evt.status || 'Upcoming Milestone');

                    return `
                        <li id="public-milestone-${safeId}">
                            <div class="timeline-step">${idx + 1}</div>
                            <div class="flex-between align-center flex-wrap gap-10">
                                <strong>${safeTitle}</strong>
                                <span class="cohort-badge open">${safeDate}</span>
                            </div>
                            <p>${safeDesc}</p>
                            <div class="mt-10" style="font-size:0.85rem; color:var(--color-teal); font-weight:600;">
                                📍 ${safeLoc} • Status: ${safeStatus}
                            </div>
                        </li>
                    `;
                }).join('');
            }
        }
    } catch (err) {
        console.error('Error rendering public milestones timeline component:', err);
        const milestonesContainer = document.getElementById('public-milestones-timeline');
        if (milestonesContainer) {
            milestonesContainer.innerHTML = `<p class="text-muted">Milestone timeline currently updating...</p>`;
        }
    }
}

function renderAdminScheduleManager() {
    try {
        const envAdminList = document.getElementById('admin-environmental-list');
        if (envAdminList) {
            const envEvents = (Array.isArray(EventStore) ? EventStore : [])
                .filter(e => e && e.category === 'environmental');
            if (envEvents.length === 0) {
                envAdminList.innerHTML = `<p class="text-muted p-20">No environmental events found.</p>`;
            } else {
                envAdminList.innerHTML = envEvents.map(evt => {
                    const safeId = escapeHtml(evt.id || '');
                    const safeBadge = escapeHtml(evt.badge || 'Environmental');
                    const safeTitle = escapeHtml(evt.title || 'Untitled Event');
                    const safeDesc = escapeHtml(evt.description || '');
                    const safeDate = escapeHtml(evt.date || 'TBD');
                    const safeTime = escapeHtml(evt.time || 'TBD');
                    const safeLoc = escapeHtml(evt.location || 'Barbados');

                    return `
                        <div class="admin-event-row glass p-20 mb-15 flex-between align-center flex-wrap gap-15">
                            <div style="flex:1; min-width:240px;">
                                <div class="flex-between align-center mb-5">
                                    <span class="badge-orange" style="font-size:0.75rem;">${safeBadge}</span>
                                    <span class="text-muted small">ID: ${safeId}</span>
                                </div>
                                <h4 style="margin-bottom:4px; font-size:1.15rem;">${safeTitle}</h4>
                                <p style="font-size:0.95rem; margin-bottom:6px; color:var(--color-text-muted);">${safeDesc}</p>
                                <div style="font-size:0.85rem; color:var(--color-teal);">
                                    📅 ${safeDate} (${safeTime}) • 📍 ${safeLoc}
                                </div>
                            </div>
                            <div class="flex-center gap-10" data-admin-only>
                                <button class="btn btn-sm btn-secondary" onclick="openEditEventModal('${safeId}')">✏️ Edit</button>
                                <button class="btn btn-sm btn-outline-orange" onclick="handleDeleteEvent('${safeId}')">🗑️ Delete</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        const milestoneAdminList = document.getElementById('admin-milestone-list');
        if (milestoneAdminList) {
            const milestoneEvents = (Array.isArray(EventStore) ? EventStore : [])
                .filter(e => e && e.category === 'milestones');
            if (milestoneEvents.length === 0) {
                milestoneAdminList.innerHTML = `<p class="text-muted p-20">No milestone events found.</p>`;
            } else {
                milestoneAdminList.innerHTML = milestoneEvents.map(evt => {
                    const safeId = escapeHtml(evt.id || '');
                    const safeBadge = escapeHtml(evt.badge || 'Milestone');
                    const safeTitle = escapeHtml(evt.title || 'Untitled Milestone');
                    const safeDesc = escapeHtml(evt.description || '');
                    const safeDate = escapeHtml(evt.date || 'TBD');
                    const safeTime = escapeHtml(evt.time || 'TBD');
                    const safeLoc = escapeHtml(evt.location || 'Barbados');

                    return `
                        <div class="admin-event-row glass p-20 mb-15 flex-between align-center flex-wrap gap-15">
                            <div style="flex:1; min-width:240px;">
                                <div class="flex-between align-center mb-5">
                                    <span class="cohort-badge open" style="font-size:0.75rem;">${safeBadge}</span>
                                    <span class="text-muted small">ID: ${safeId}</span>
                                </div>
                                <h4 style="margin-bottom:4px; font-size:1.15rem;">${safeTitle}</h4>
                                <p style="font-size:0.95rem; margin-bottom:6px; color:var(--color-text-muted);">${safeDesc}</p>
                                <div style="font-size:0.85rem; color:var(--color-teal);">
                                    📅 ${safeDate} (${safeTime}) • 📍 ${safeLoc}
                                </div>
                            </div>
                            <div class="flex-center gap-10" data-admin-only>
                                <button class="btn btn-sm btn-secondary" onclick="openEditEventModal('${safeId}')">✏️ Edit</button>
                                <button class="btn btn-sm btn-outline-orange" onclick="handleDeleteEvent('${safeId}')">🗑️ Delete</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    } catch (err) {
        console.error('Error rendering admin schedule manager component:', err);
    }
}

function handleDeleteEvent(id) {
    if (typeof checkAuth === 'function' && !checkAuth('admin')) {
        alert('Unauthorized action. Admin role required.');
        return;
    }
    if (confirm('Are you sure you want to delete this event schedule?')) {
        deleteEvent(id);
    }
}

function openCreateEventModal(defaultCategory = 'environmental') {
    if (typeof checkAuth === 'function' && !checkAuth('admin')) {
        alert('Unauthorized. Please log in as Admin first.');
        return;
    }

    const modal = document.getElementById('event-editor-modal');
    if (!modal) return;

    try {
        const titleEl = document.getElementById('event-modal-title');
        const idEl = document.getElementById('event-form-id');
        const catEl = document.getElementById('event-form-category');
        const nameEl = document.getElementById('event-form-title');
        const badgeEl = document.getElementById('event-form-badge');
        const dateEl = document.getElementById('event-form-date');
        const timeEl = document.getElementById('event-form-time');
        const locEl = document.getElementById('event-form-location');
        const statusEl = document.getElementById('event-form-status');
        const descEl = document.getElementById('event-form-description');

        if (titleEl) titleEl.textContent = 'Create New Event Schedule';
        if (idEl) idEl.value = '';
        if (catEl) catEl.value = defaultCategory;
        if (nameEl) nameEl.value = '';
        if (badgeEl) badgeEl.value = defaultCategory === 'environmental' ? 'Water Conservation' : 'Milestone';
        if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
        if (timeEl) timeEl.value = '09:00 AM';
        if (locEl) locEl.value = 'Barbados Youth Engine HQ';
        if (statusEl) statusEl.value = 'Scheduled';
        if (descEl) descEl.value = '';

        modal.classList.add('active');
        modal.style.display = 'flex';
    } catch (err) {
        console.error('Error opening create event modal:', err);
    }
}

function openEditEventModal(id) {
    if (typeof checkAuth === 'function' && !checkAuth('admin')) {
        alert('Unauthorized. Please log in as Admin first.');
        return;
    }

    const evt = EventStore.find(e => e && e.id === id);
    if (!evt) return;

    const modal = document.getElementById('event-editor-modal');
    if (!modal) return;

    try {
        const titleEl = document.getElementById('event-modal-title');
        const idEl = document.getElementById('event-form-id');
        const catEl = document.getElementById('event-form-category');
        const nameEl = document.getElementById('event-form-title');
        const badgeEl = document.getElementById('event-form-badge');
        const dateEl = document.getElementById('event-form-date');
        const timeEl = document.getElementById('event-form-time');
        const locEl = document.getElementById('event-form-location');
        const statusEl = document.getElementById('event-form-status');
        const descEl = document.getElementById('event-form-description');

        if (titleEl) titleEl.textContent = 'Edit Event Schedule';
        if (idEl) idEl.value = evt.id || '';
        if (catEl) catEl.value = evt.category || 'environmental';
        if (nameEl) nameEl.value = evt.title || '';
        if (badgeEl) badgeEl.value = evt.badge || '';
        if (dateEl) dateEl.value = evt.date || '';
        if (timeEl) timeEl.value = evt.time || '';
        if (locEl) locEl.value = evt.location || '';
        if (statusEl) statusEl.value = evt.status || '';
        if (descEl) descEl.value = evt.description || '';

        modal.classList.add('active');
        modal.style.display = 'flex';
    } catch (err) {
        console.error('Error opening edit event modal:', err);
    }
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
    if (typeof checkAuth === 'function' && !checkAuth('admin')) {
        alert('Unauthorized.');
        return;
    }

    try {
        const id = document.getElementById('event-form-id')?.value?.trim() || '';
        const category = document.getElementById('event-form-category')?.value?.trim() || 'environmental';
        const title = document.getElementById('event-form-title')?.value?.trim() || '';
        const badge = document.getElementById('event-form-badge')?.value?.trim() || 'Environmental';
        const date = document.getElementById('event-form-date')?.value?.trim() || new Date().toISOString().split('T')[0];
        const time = document.getElementById('event-form-time')?.value?.trim() || '09:00 AM';
        const location = document.getElementById('event-form-location')?.value?.trim() || 'Barbados Youth Engine HQ';
        const status = document.getElementById('event-form-status')?.value?.trim() || 'Scheduled';
        const description = document.getElementById('event-form-description')?.value?.trim() || '';

        if (!title) {
            alert('Please enter an event / milestone title.');
            return;
        }

        const payload = { category, title, badge, date, time, location, status, description };

        if (id) {
            updateEvent(id, payload);
        } else {
            addEvent(payload);
        }

        closeEventModal();
    } catch (err) {
        console.error('Error handling save event:', err);
        alert('Failed to save event schedule. Please try again.');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (m) {
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

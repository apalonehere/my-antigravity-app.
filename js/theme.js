// --- Theme Switcher Module ---
function initTheme() {
    const savedTheme = localStorage.getItem('green-rising-theme');
    applyTheme(savedTheme === 'dark');
}

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
}

function applyTheme(isDark) {
    const togglePills = document.querySelectorAll('.theme-toggle-pill');
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('green-rising-theme', 'dark');
        togglePills.forEach(pill => {
            pill.innerHTML = '<svg class="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg><span class="theme-text">Light Mode</span>';
        });
        toggleBtns.forEach(btn => {
            btn.innerHTML = '<svg class="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>';
        });
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('green-rising-theme', 'light');
        togglePills.forEach(pill => {
            pill.innerHTML = '<svg class="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path></svg><span class="theme-text">Dark Mode</span>';
        });
        toggleBtns.forEach(btn => {
            btn.innerHTML = '<svg class="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path></svg>';
        });
    }
}

window.initTheme   = initTheme;
window.toggleTheme = toggleTheme;
window.applyTheme  = applyTheme;

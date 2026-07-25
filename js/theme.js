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
            pill.innerHTML = '☀️ <span class="theme-text">Light Mode</span>';
        });
        toggleBtns.forEach(btn => {
            btn.innerText = '☀️';
        });
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('green-rising-theme', 'light');
        togglePills.forEach(pill => {
            pill.innerHTML = '🌙 <span class="theme-text">Dark Mode</span>';
        });
        toggleBtns.forEach(btn => {
            btn.innerText = '🌙';
        });
    }
}

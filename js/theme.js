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
            pill.innerHTML = '\u2600\ufe0f <span class="theme-text">Light Mode</span>';
        });
        toggleBtns.forEach(btn => {
            btn.innerText = '\u2600\ufe0f';
        });
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('green-rising-theme', 'light');
        togglePills.forEach(pill => {
            pill.innerHTML = '\uD83C\uDF19 <span class="theme-text">Dark Mode</span>';
        });
        toggleBtns.forEach(btn => {
            btn.innerText = '\uD83C\uDF19';
        });
    }
}

window.initTheme   = initTheme;
window.toggleTheme = toggleTheme;
window.applyTheme  = applyTheme;

// --- Navigation & Router Module ---
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const tabId = link.getAttribute('data-tab');
            if (tabId) {
                e.preventDefault();
                switchView(tabId);
                window.location.hash = tabId;
            }
        });
    });
}

function switchView(viewId) {
    const views = document.querySelectorAll('.app-view');
    const navLinks = document.querySelectorAll('.nav-link');

    views.forEach(view => {
        if (view.id === `view-${viewId}`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    navLinks.forEach(link => {
        if (link.getAttribute('data-tab') === viewId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initHashRouter() {
    const handleHash = () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            if (['water', 'cyen', 'ecovillage', 'yots', 'pinelands'].includes(hash)) {
                switchView('programmes');
                openProgram(hash);
            } else if (['home', 'programmes', 'team', 'dashboard', 'quiz', 'apply'].includes(hash)) {
                switchView(hash);
            }
        }
    };
    
    window.addEventListener('hashchange', handleHash);
    handleHash();
}

function initMobileMenu() {
    const mobileBtn = document.getElementById('mobile-toggle-btn');
    const mainNav = document.getElementById('main-navigation');
    
    if (mobileBtn && mainNav) {
        mobileBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileBtn.classList.toggle('open');
        });
        
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                mobileBtn.classList.remove('open');
            });
        });
    }
}

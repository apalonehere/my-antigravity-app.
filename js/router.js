// --- Navigation & Router Module ---

function isAdminAuthenticated() {
    return localStorage.getItem('isAdminAuthenticated') === 'true' ||
           localStorage.getItem('admin_auth') === 'true' ||
           localStorage.getItem('isAuthenticated') === 'true' ||
           localStorage.getItem('admin_pin_auth') === 'true';
}

function getAdminPin() {
    if (typeof process !== 'undefined' && process.env && process.env.ADMIN_PIN) {
        return process.env.ADMIN_PIN;
    }
    if (typeof window !== 'undefined' && window.process && window.process.env && window.process.env.ADMIN_PIN) {
        return window.process.env.ADMIN_PIN;
    }
    if (typeof window !== 'undefined' && window.ADMIN_PIN) {
        return window.ADMIN_PIN;
    }
    return '1234';
}

function updateAuthUI() {
    const authenticated = isAdminAuthenticated();
    window.isAuthenticated = authenticated;

    const adminElements = document.querySelectorAll('.admin-only:not(.app-view), [data-admin="true"]:not(.app-view)');
    adminElements.forEach(el => {
        if (authenticated) {
            el.style.display = '';
            el.classList.remove('hidden');
        } else {
            el.style.display = 'none';
            el.classList.add('hidden');
        }
    });

    const adminTabBtn = document.getElementById('dash-admin-tab-btn');
    if (adminTabBtn) {
        adminTabBtn.style.display = authenticated ? '' : 'none';
    }
}

function logoutAdmin() {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('admin_pin_auth');
    window.isAuthenticated = false;
    updateAuthUI();
    switchView('home');
    window.location.hash = 'home';
}

function switchAdminTab(tabId, btnEl) {
    const tabBtns = document.querySelectorAll('.admin-portal-tab-btn');
    const tabPanes = document.querySelectorAll('.admin-tab-pane');

    tabBtns.forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    tabPanes.forEach(pane => {
        if (pane.id === `admin-tab-${tabId}`) {
            pane.classList.add('active');
            pane.style.display = 'block';
        } else {
            pane.classList.remove('active');
            pane.style.display = 'none';
        }
    });
}

function handleLoginSubmit(event) {
    if (event) event.preventDefault();
    const pinInput = document.getElementById('passkey-input');
    const errorMsg = document.getElementById('login-error-msg');
    const enteredPin = pinInput ? pinInput.value.trim() : '';
    const validPin = getAdminPin();

    if (enteredPin === validPin) {
        localStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('admin_auth', 'true');
        window.isAuthenticated = true;
        if (errorMsg) {
            errorMsg.style.display = 'none';
            errorMsg.classList.add('hidden');
        }
        if (pinInput) pinInput.value = '';
        updateAuthUI();
        switchView('admin');
        window.location.hash = 'admin';
    } else {
        if (errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.classList.remove('hidden');
        }
    }
}

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
    if ((viewId === 'login' || viewId === 'admin') && !isAdminAuthenticated() && viewId !== 'login') {
        viewId = 'login';
    }

    const views = document.querySelectorAll('.app-view');
    const navLinks = document.querySelectorAll('.nav-link');

    views.forEach(view => {
        if (view.id === `view-${viewId}`) {
            view.classList.add('active');
            view.style.display = 'block';
        } else {
            view.classList.remove('active');
            view.style.display = 'none';
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
        const pathname = window.location.pathname;

        updateAuthUI();

        if (hash === 'login' || hash === 'admin' || pathname === '/admin' || pathname.endsWith('/admin')) {
            if (!isAdminAuthenticated()) {
                switchView('login');
            } else {
                switchView('admin');
            }
            return;
        }

        if (hash) {
            if (['water', 'cyen', 'ecovillage', 'yots', 'pinelands'].includes(hash)) {
                switchView('programmes');
                if (typeof openProgram === 'function') openProgram(hash);
            } else if (['home', 'programmes', 'team', 'dashboard', 'resources', 'quiz', 'apply'].includes(hash)) {
                switchView(hash);
            }
        }
    };
    
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
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

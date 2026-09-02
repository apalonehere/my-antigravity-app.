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
    navigateTo('/home');
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
        navigateTo('/admin');
    } else {
        if (errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.classList.remove('hidden');
        }
    }
}

function normalizeProgId(progId) {
    if (!progId) return 'tomorrowsreef';
    const clean = String(progId).toLowerCase().trim().replace(/^#/, '').replace(/^\//, '');
    if (clean.includes('eco-leader') || clean.includes('ecoleader') || clean.includes('workshop')) return 'ecoleaders';
    if (clean.includes('reef') || clean.includes('tomorrow') || clean.includes('oceana')) return 'tomorrowsreef';
    return 'tomorrowsreef';
}

function openProgram(progId, updateUrl = false) {
    switchView('programmes', updateUrl);
    const targetKey = normalizeProgId(progId);
    const subTabBtns = document.querySelectorAll('.programme-sub-tabs .sub-tab-btn');
    const detailPanes = document.querySelectorAll('.prog-detail-pane');

    subTabBtns.forEach(btn => {
        const btnProg = normalizeProgId(btn.getAttribute('data-prog'));
        if (btnProg === targetKey) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    detailPanes.forEach(pane => {
        const paneId = pane.id.replace(/^prog-/, '');
        if (normalizeProgId(paneId) === targetKey) {
            pane.classList.add('active');
            pane.style.display = 'block';
        } else {
            pane.classList.remove('active');
            pane.style.display = 'none';
        }
    });

    if (updateUrl) {
        const cleanPath = `/programmes/${targetKey}`;
        if (window.location.pathname !== cleanPath) {
            window.history.pushState({ viewId: 'programmes', subTab: targetKey }, '', cleanPath);
        }
    }

}

function initProgrammeSubTabs() {
    const subTabBtns = document.querySelectorAll('.programme-sub-tabs .sub-tab-btn');
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            const progKey = btn.getAttribute('data-prog');
            if (progKey) {
                openProgram(progKey, true);
            }
            // Keep the tablist's state in the accessibility tree, not just the
            // class list - the bar is role="tablist" now that it is back.
            subTabBtns.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
        });
    });
}

function navigateTo(path, pushState = true) {
    if (!path) path = '/';
    let cleanPath = path.toLowerCase().trim();
    if (cleanPath.startsWith('#')) {
        cleanPath = '/' + cleanPath.substring(1);
    }
    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }
    
    let viewId = 'home';
    let subTab = null;

    if (cleanPath === '/' || cleanPath === '/home') {
        viewId = 'home';
        cleanPath = '/';
    } else if (cleanPath.startsWith('/programmes') || cleanPath.startsWith('/programs')) {
        viewId = 'programmes';
        const parts = cleanPath.split('/').filter(Boolean);
        if (parts.length > 1) {
            subTab = parts[1];
        }
    } else if (cleanPath === '/team') {
        viewId = 'team';
    } else if (cleanPath === '/dashboard' || cleanPath === '/impact') {
        viewId = 'dashboard';
        cleanPath = '/dashboard';
    } else if (cleanPath === '/resources') {
        viewId = 'resources';
    } else if (cleanPath === '/quiz') {
        viewId = 'quiz';
    } else if (cleanPath === '/play' || cleanPath === '/games' || cleanPath === '/arcade') {
        viewId = 'play';
        cleanPath = '/play';
    } else if (cleanPath === '/apply') {
        viewId = 'apply';
    } else if (cleanPath === '/admin') {
        viewId = isAdminAuthenticated() ? 'admin' : 'login';
        cleanPath = isAdminAuthenticated() ? '/admin' : '/login';
    } else if (cleanPath === '/login') {
        viewId = 'login';
    } else {
        const rawKey = cleanPath.replace(/^\//, '');
        if (['tomorrowsreef', 'reef', 'ecoleaders', 'eco-leaders'].includes(rawKey)) {
            viewId = 'programmes';
            subTab = rawKey;
            cleanPath = '/programmes/' + normalizeProgId(rawKey);
        }
    }

    if (pushState && window.location.pathname !== cleanPath) {
        window.history.pushState({ viewId, subTab }, '', cleanPath);
    }

    switchView(viewId, false);

    if (viewId === 'programmes' && subTab) {
        openProgram(subTab, false);
    }

    if (viewId === 'apply' && typeof resetApplyForm === 'function') {
        resetApplyForm();
    }
}

function initNavigation() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        const dataTab = link.getAttribute('data-tab');

        if (dataTab) {
            e.preventDefault();
            const targetPath = (dataTab === 'home') ? '/' : `/${dataTab}`;
            navigateTo(targetPath, true);
            return;
        }

        if (href && (href.startsWith('/') || href.startsWith('#'))) {
            // Internal HTML5 route link
            e.preventDefault();
            navigateTo(href, true);
        }
    });
}

function switchView(viewId, updateState = true) {
    if (viewId === 'admin' || viewId === 'login') {
        if (!isAdminAuthenticated()) {
            viewId = 'login';
        } else {
            viewId = 'admin';
        }
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

    const floatingApply = document.getElementById('floating-apply');
    if (floatingApply) {
        floatingApply.style.display = (viewId === 'admin') ? 'none' : '';
    }

    if (document.body) {
        if (viewId === 'admin') {
            document.body.classList.add('on-admin-view');
        } else {
            document.body.classList.remove('on-admin-view');
        }
    }

    navLinks.forEach(link => {
        const linkTab = link.getAttribute('data-tab');
        const linkHref = link.getAttribute('href');
        if (linkTab === viewId || (linkHref && (linkHref === `/${viewId}` || (viewId === 'home' && linkHref === '/')))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (updateState) {
        const targetPath = (viewId === 'home') ? '/' : `/${viewId}`;
        if (window.location.pathname !== targetPath) {
            window.history.pushState({ viewId }, '', targetPath);
        }
    }

    if (typeof initAdminTabsModules === 'function') initAdminTabsModules();
    if (typeof initImpactMetrics === 'function') initImpactMetrics();
    if (typeof renderPublicSchedulesGrid === 'function') renderPublicSchedulesGrid();

    // The arcade's sorting game runs a countdown. Navigating away hides the
    // board but would not stop the clock, so the run is retired here rather
    // than left ticking down to a score nobody was playing for.
    if (viewId !== 'play' && typeof pauseEcoArcade === 'function') pauseEcoArcade();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initHTML5Router() {
    const handleRoute = () => {
        updateAuthUI();
        const hash = window.location.hash;
        const pathname = window.location.pathname;

        // Backward compatibility: Convert legacy hash fragments to HTML5 clean paths
        if (hash && hash.length > 1) {
            const rawHash = hash.substring(1);
            const targetPath = (rawHash === 'home') ? '/' : `/${rawHash}`;
            window.history.replaceState({}, '', targetPath);
            navigateTo(targetPath, false);
            return;
        }

        navigateTo(pathname, false);
    };

    window.addEventListener('popstate', handleRoute);
    handleRoute();
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

window.navigateTo = navigateTo;
window.openProgram = openProgram;
window.initProgrammeSubTabs = initProgrammeSubTabs;
window.switchView = switchView;
window.initHTML5Router = initHTML5Router;


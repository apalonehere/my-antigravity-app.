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

function normalizeProgId(progId) {
    if (!progId) return 'tomorrowsreef';
    const clean = String(progId).toLowerCase().trim().replace(/^#/, '');
    if (clean.includes('reef') || clean.includes('tomorrow') || clean.includes('oceana')) return 'tomorrowsreef';
    if (clean.includes('eco') || clean.includes('village')) return 'ecovillage';
    if (clean.includes('yots') || clean.includes('boat')) return 'tomorrowsreef';
    if (clean.includes('pine') || clean.includes('pavilion') || clean.includes('pavillion')) return 'pinelands';
    return 'tomorrowsreef';
}

function openProgram(progId) {
    switchView('programmes');
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
}

function initProgrammeSubTabs() {
    const subTabBtns = document.querySelectorAll('.programme-sub-tabs .sub-tab-btn');
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            const progKey = btn.getAttribute('data-prog');
            if (progKey) {
                openProgram(progKey);
                window.location.hash = progKey;
            }
        });
    });
}

function initVillageTabs() {
    const villageBtns = document.querySelectorAll('.village-tab-btn');
    const villagePanes = document.querySelectorAll('.village-zone-pane');

    villageBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            const zoneKey = btn.getAttribute('data-zone');
            
            villageBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            villagePanes.forEach(pane => {
                if (pane.id === `zone-${zoneKey}`) {
                    pane.classList.add('active');
                    pane.style.display = 'block';
                } else {
                    pane.classList.remove('active');
                    pane.style.display = 'none';
                }
            });
        });
    });
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, #quick-apply-btn, #floating-apply, a[href="#apply"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const dataTab = link.getAttribute('data-tab');
            const href = link.getAttribute('href');
            let targetId = dataTab;
            if (!targetId && href && href.startsWith('#')) {
                targetId = href.substring(1);
            }
            if (targetId) {
                e.preventDefault();
                switchView(targetId);
                window.location.hash = targetId;

                if (targetId === 'apply' && typeof resetApplyForm === 'function') {
                    resetApplyForm();
                }
            }
        });
    });
}

function switchView(viewId) {
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
        if (link.getAttribute('data-tab') === viewId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (typeof initAdminTabsModules === 'function') initAdminTabsModules();
    if (typeof initImpactMetrics === 'function') initImpactMetrics();
    if (typeof renderPublicSchedulesGrid === 'function') renderPublicSchedulesGrid();

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
            if (['tomorrowsreef', 'reef', 'tomorrows-reef', 'ecovillage', 'yots', 'pinelands', 'eco-village', 'yots-boat-building', 'pinelands-pavillion', 'pinelands-pavilion'].includes(hash)) {
                openProgram(hash);
            } else if (['home', 'programmes', 'team', 'dashboard', 'resources', 'quiz', 'apply'].includes(hash)) {
                switchView(hash);
                if (hash === 'apply' && typeof resetApplyForm === 'function') {
                    resetApplyForm();
                }
            } else if (hash === 'admin' || hash === 'login') {
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

window.openProgram = openProgram;
window.initProgrammeSubTabs = initProgrammeSubTabs;
window.initVillageTabs = initVillageTabs;
window.switchView = switchView;

// --- Navigation & Hash Router Module with Strict Section Isolation & Passkey Guards ---
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, [data-tab]');
    navLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', (e) => {
                const tabId = link.getAttribute('data-tab');
                if (tabId) {
                    e.preventDefault();
                    switchView(tabId);
                    window.location.hash = tabId;
                }
            });
        }
    });
}

function switchView(viewId) {
    try {
        // Standardize view aliases
        if (viewId === 'admin' || viewId === 'admin-login') {
            const isAuth = typeof checkAuth === 'function' ? checkAuth('admin') : false;
            viewId = isAuth ? 'admin-environmental' : 'login';
        } else if (viewId === 'impact-hub') {
            viewId = 'dashboard';
        } else if (viewId === 'teams') {
            viewId = 'team';
        } else if (viewId === 'apply-now') {
            viewId = 'apply';
        } else if (viewId === 'match-quiz') {
            viewId = 'quiz';
        }

        // Protected Admin Route Guard
        const isAdminRoute = viewId.startsWith('admin-') || ['admin-impact', 'admin-environmental', 'admin-milestones', 'admin-cohorts', 'admin-environmental-metrics'].includes(viewId);
        if (isAdminRoute) {
            const isAuthorized = typeof checkAuth === 'function' ? checkAuth('admin') : false;
            if (!isAuthorized) {
                console.warn(`Access Denied to protected route: #${viewId}. Redirecting to passkey login.`);
                viewId = 'login';
                window.location.hash = 'login';
            }
        }

        const views = document.querySelectorAll('.app-view');
        const navLinks = document.querySelectorAll('.nav-link');

        let targetFound = false;
        views.forEach(view => {
            if (view && view.id === `view-${viewId}`) {
                view.classList.add('active');
                view.style.display = 'block';
                targetFound = true;
            } else if (view) {
                view.classList.remove('active');
                view.style.display = 'none';
            }
        });

        if (!targetFound && views.length > 0) {
            const homeView = document.getElementById('view-home');
            if (homeView) {
                homeView.classList.add('active');
                homeView.style.display = 'block';
            }
        }

        navLinks.forEach(link => {
            if (link && link.getAttribute('data-tab') === viewId) {
                link.classList.add('active');
            } else if (link) {
                link.classList.remove('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Error switching view:', err);
    }
}

function initHashRouter() {
    try {
        const handleHash = () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                if (['water', 'cyen', 'ecovillage', 'yots', 'pinelands'].includes(hash)) {
                    switchView('programmes');
                    if (typeof openProgram === 'function') openProgram(hash);
                } else if (['admin', 'admin-login'].includes(hash)) {
                    const isAuth = typeof checkAuth === 'function' ? checkAuth('admin') : false;
                    switchView(isAuth ? 'admin-environmental' : 'login');
                } else if (['home', 'programmes', 'team', 'teams', 'dashboard', 'impact-hub', 'resources', 'quiz', 'match-quiz', 'apply', 'apply-now', 'login', 'forbidden', 'admin-impact', 'admin-environmental', 'admin-milestones', 'admin-cohorts', 'admin-environmental-metrics'].includes(hash)) {
                    switchView(hash);
                }
            }
        };
        
        window.addEventListener('hashchange', handleHash);
        handleHash();
    } catch (err) {
        console.error('Error initializing hash router:', err);
    }
}

function initMobileMenu() {
    try {
        const mobileBtn = document.getElementById('mobile-toggle-btn');
        const mainNav = document.getElementById('main-navigation');
        
        if (mobileBtn && mainNav) {
            mobileBtn.addEventListener('click', () => {
                mainNav.classList.toggle('active');
                mobileBtn.classList.toggle('open');
            });
            
            mainNav.querySelectorAll('a').forEach(link => {
                if (link) {
                    link.addEventListener('click', () => {
                        mainNav.classList.remove('active');
                        mobileBtn.classList.remove('open');
                    });
                }
            });
        }
    } catch (err) {
        console.error('Error initializing mobile menu:', err);
    }
}

window.initNavigation = initNavigation;
window.switchView = switchView;
window.initHashRouter = initHashRouter;
window.initMobileMenu = initMobileMenu;

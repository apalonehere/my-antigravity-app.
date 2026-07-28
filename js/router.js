// --- Navigation & Hash Router Module — Strict Public/Admin Boundary ---
// PUBLIC ROUTES: home, programmes, team, dashboard, resources, quiz, apply, login, forbidden
// ADMIN ROUTES:  admin-environmental, admin-milestones, admin-cohorts,
//                admin-environmental-metrics, admin-impact
// RULES:
//   - Root path / or empty hash → ALWAYS render #home (no redirect to admin)
//   - Admin routes → require authenticated admin session; else → #view-login
//   - Admin session NEVER auto-redirects public visitors away from public routes

const PUBLIC_VIEWS = [
    'home', 'programmes', 'team', 'dashboard', 'resources',
    'quiz', 'apply', 'login', 'forbidden'
];

const ADMIN_VIEWS = [
    'admin-environmental', 'admin-milestones', 'admin-cohorts',
    'admin-environmental-metrics', 'admin-impact'
];

const PROG_DEEP_LINKS = ['water', 'cyen', 'ecovillage', 'yots', 'pinelands'];

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, [data-tab]');
    navLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', (e) => {
                const tabId = link.getAttribute('data-tab');
                if (tabId) {
                    e.preventDefault();
                    navigateTo(tabId);
                }
            });
        }
    });
}

/**
 * Primary navigation function.
 * - Public routes are always accessible without auth.
 * - Admin routes require admin session; unauthenticated visits → login screen.
 * - Never auto-redirects to an admin view on site load.
 */
function navigateTo(viewId) {
    try {
        // ── Alias normalization ──
        if (viewId === 'impact-hub')   viewId = 'dashboard';
        if (viewId === 'teams')        viewId = 'team';
        if (viewId === 'apply-now')    viewId = 'apply';
        if (viewId === 'match-quiz')   viewId = 'quiz';
        if (viewId === 'admin' || viewId === 'admin-login') {
            // /admin URL → show login if unauthenticated, admin portal if authenticated
            const isAuth = typeof checkAuth === 'function' ? checkAuth('admin') : false;
            viewId = isAuth ? 'admin-environmental' : 'login';
        }

        // ── Admin route guard ──
        const isAdminRoute = ADMIN_VIEWS.includes(viewId) || viewId.startsWith('admin-');
        if (isAdminRoute) {
            const isAuthorized = typeof checkAuth === 'function' ? checkAuth('admin') : false;
            if (!isAuthorized) {
                console.warn(`[Router] Access denied to #${viewId} — redirecting to passkey login.`);
                viewId = 'login';
                window.location.hash = 'login';
            }
        }

        _activateView(viewId);

        // Update hash without re-triggering the hashchange handler unnecessarily
        const desiredHash = viewId;
        if (window.location.hash.substring(1) !== desiredHash) {
            window.location.hash = desiredHash;
        }
    } catch (err) {
        console.error('[Router] navigateTo error:', err);
    }
}

/**
 * Legacy alias — kept for backward compatibility with inline onclick="switchView(...)"
 * calls throughout the HTML. Delegates to navigateTo().
 */
function switchView(viewId) {
    navigateTo(viewId);
}

/**
 * DOM manipulation: show the target view, hide all others, update nav active state.
 */
function _activateView(viewId) {
    try {
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

        // Graceful fallback: unknown view → home
        if (!targetFound) {
            const homeView = document.getElementById('view-home');
            if (homeView) {
                homeView.classList.add('active');
                homeView.style.display = 'block';
                viewId = 'home';
            }
        }

        navLinks.forEach(link => {
            const tab = link.getAttribute('data-tab');
            if (link && (tab === viewId || (viewId === 'dashboard' && tab === 'dashboard'))) {
                link.classList.add('active');
            } else if (link) {
                link.classList.remove('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('[Router] _activateView error:', err);
    }
}

/**
 * Hash router — handles browser hash changes and initial page load.
 * Critical rule: empty hash or unknown hash → home, NEVER admin.
 */
function initHashRouter() {
    try {
        const handleHash = () => {
            const raw = window.location.hash.substring(1).trim();

            // ── Empty hash or bare # → public homepage ──
            if (!raw) {
                _activateView('home');
                return;
            }

            // ── Programme deep-links ──
            if (PROG_DEEP_LINKS.includes(raw)) {
                _activateView('programmes');
                if (typeof openProgram === 'function') openProgram(raw);
                return;
            }

            // ── Admin deep-link: /admin or #admin ──
            if (raw === 'admin' || raw === 'admin-login') {
                const isAuth = typeof checkAuth === 'function' ? checkAuth('admin') : false;
                _activateView(isAuth ? 'admin-environmental' : 'login');
                return;
            }

            // ── Known admin route — guard check ──
            if (ADMIN_VIEWS.includes(raw) || raw.startsWith('admin-')) {
                const isAuth = typeof checkAuth === 'function' ? checkAuth('admin') : false;
                if (!isAuth) {
                    _activateView('login');
                    window.location.hash = 'login';
                } else {
                    _activateView(raw);
                }
                return;
            }

            // ── Known public routes ──
            const normalizedPublic = {
                'impact-hub': 'dashboard',
                'teams': 'team',
                'apply-now': 'apply',
                'match-quiz': 'quiz'
            };
            const resolved = normalizedPublic[raw] || raw;

            if (PUBLIC_VIEWS.includes(resolved)) {
                _activateView(resolved);
                return;
            }

            // ── Unknown hash → safe fallback to home ──
            console.warn(`[Router] Unknown hash "#${raw}" — falling back to home.`);
            _activateView('home');
        };

        window.addEventListener('hashchange', handleHash);

        // Initial load: if no hash, explicitly show home
        if (!window.location.hash || window.location.hash === '#') {
            window.location.hash = 'home';
        }
        handleHash();
    } catch (err) {
        console.error('[Router] initHashRouter error:', err);
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
        console.error('[Router] initMobileMenu error:', err);
    }
}

window.initNavigation   = initNavigation;
window.navigateTo       = navigateTo;
window.switchView       = switchView;   // backward compat alias
window.initHashRouter   = initHashRouter;
window.initMobileMenu   = initMobileMenu;

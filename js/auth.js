// Green Rising Barbados — Auth & Role-Based Access Control (RBAC) Module with Custom Environment Passkey

const AuthState = {
    user: null,
    role: 'public', // 'public' | 'admin'
    isAuthenticated: false
};

function getAdminPin() {
    if (typeof process !== 'undefined' && process.env && process.env.ADMIN_PIN) {
        return process.env.ADMIN_PIN.trim();
    }
    if (typeof window !== 'undefined' && window.ENV && window.ENV.ADMIN_PIN) {
        return window.ENV.ADMIN_PIN.trim();
    }
    return '2026-GREEN-RISING-ADMIN';
}

function initAuth() {
    const savedAuth = localStorage.getItem('greenrising_auth');
    if (savedAuth) {
        try {
            const parsed = JSON.parse(savedAuth);
            AuthState.user = parsed.user;
            AuthState.role = parsed.role || 'public';
            AuthState.isAuthenticated = !!parsed.isAuthenticated;
        } catch (e) {
            console.error('Failed to parse auth state', e);
        }
    }
    syncAuthUI();
}

function saveAuthState() {
    localStorage.setItem('greenrising_auth', JSON.stringify({
        user: AuthState.user,
        role: AuthState.role,
        isAuthenticated: AuthState.isAuthenticated
    }));
}

function loginPasskey(pin) {
    const expectedPin = getAdminPin();
    if (pin && pin.trim() === expectedPin) {
        AuthState.user = { email: 'admin@greenrising.bb', name: 'Site Administrator' };
        AuthState.role = 'admin';
        AuthState.isAuthenticated = true;
        saveAuthState();
        syncAuthUI();
        return { success: true, message: 'Admin authentication successful!' };
    } else {
        return { success: false, message: 'Invalid Admin Passkey/PIN. Check process.env.ADMIN_PIN' };
    }
}

function login(email, passwordOrPin) {
    // Support either email/passkey or direct passkey
    if (passwordOrPin && passwordOrPin.trim() === getAdminPin()) {
        return loginPasskey(passwordOrPin);
    } else if (email && email.trim() === getAdminPin()) {
        return loginPasskey(email);
    } else {
        return { success: false, message: 'Invalid Admin Passkey. Authentication failed.' };
    }
}

function logout() {
    AuthState.user = null;
    AuthState.role = 'public';
    AuthState.isAuthenticated = false;
    saveAuthState();
    syncAuthUI();
    // Always return to public homepage on logout, regardless of current view
    if (typeof navigateTo === 'function') {
        navigateTo('home');
    } else {
        window.location.hash = 'home';
    }
}

function setRole(newRole) {
    if (newRole === 'admin') {
        AuthState.user = { email: 'admin@greenrising.bb', name: 'Site Administrator' };
        AuthState.role = 'admin';
        AuthState.isAuthenticated = true;
        saveAuthState();
        syncAuthUI();
    } else {
        // setRole('public') is equivalent to logout — use full logout flow
        logout();
    }
}

function checkAuth(requiredRole = 'admin') {
    if (requiredRole === 'admin') {
        return AuthState.isAuthenticated && AuthState.role === 'admin';
    }
    return true;
}

function syncAuthUI() {
    const body = document.body;
    const isAdmin = AuthState.role === 'admin' && AuthState.isAuthenticated;

    // Body class reflects auth state (used by CSS [data-admin-only] rules)
    if (isAdmin) {
        body.classList.add('user-is-admin');
        body.classList.remove('user-is-public');
    } else {
        body.classList.add('user-is-public');
        body.classList.remove('user-is-admin');
    }

    // Toggle [data-admin-only] elements — visibility only, NEVER routing
    const adminOnlyElements = document.querySelectorAll('[data-admin-only]');
    adminOnlyElements.forEach(el => {
        if (isAdmin) {
            el.style.display = '';
            el.removeAttribute('hidden');
        } else {
            el.style.display = 'none';
            el.setAttribute('hidden', 'true');
        }
    });

    // Admin nav link visibility
    const adminNavLinks = document.querySelectorAll('.nav-admin-link');
    adminNavLinks.forEach(link => {
        link.style.display = isAdmin ? 'inline-flex' : 'none';
    });

    // Re-render data lists that depend on auth state (read-only — no navigation side effects)
    try {
        if (typeof renderAdminScheduleManager === 'function') renderAdminScheduleManager();
    } catch(e) { /* non-critical */ }
    try {
        if (typeof renderPublicSchedules === 'function') renderPublicSchedules();
    } catch(e) { /* non-critical */ }
}

window.AuthState = AuthState;
window.getAdminPin = getAdminPin;
window.initAuth = initAuth;
window.loginPasskey = loginPasskey;
window.login = login;
window.logout = logout;
window.setRole = setRole;
window.checkAuth = checkAuth;
window.syncAuthUI = syncAuthUI;

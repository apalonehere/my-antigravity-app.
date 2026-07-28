// Green Rising Barbados — Main App Entry Point & Orchestrator

document.addEventListener('DOMContentLoaded', () => {
    try {
        // 1. Auth must be first — restores session state from localStorage.
        //    syncAuthUI() is called inside but will NOT redirect; routing is
        //    handled exclusively by initHashRouter below.
        if (typeof initAuth === 'function') initAuth();

        // 2. Data stores — must load before views render
        if (typeof initEventStore === 'function') initEventStore();
        if (typeof initMetricsStore === 'function') initMetricsStore();

        // 3. Theme & UI chrome
        if (typeof initTheme === 'function') initTheme();
        if (typeof initNavigation === 'function') initNavigation();
        if (typeof initMobileMenu === 'function') initMobileMenu();
        initProgrammeSubTabs();
        initVillageTabs();
        if (typeof initResourcesHub === 'function') initResourcesHub();

        // 4. Hash router LAST — reads fully-initialized auth + data state,
        //    then activates the correct view based on URL hash.
        //    Empty hash or / → always shows #home for public visitors.
        if (typeof initHashRouter === 'function') initHashRouter();

        // 5. Polish
        initScrollReveal();
        initRippleEffect();
    } catch (err) {
        console.error('App initialization error boundary caught exception:', err);
    }
});

// Scroll-triggered reveal animations
function initScrollReveal() {
    try {
        const revealTargets = [
            { selector: '.program-card',         delay: true },
            { selector: '.home-impact-brief',    delay: false },
            { selector: '.stat-item',            delay: true },
            { selector: '.glass',                delay: false },
            { selector: '.pinelands-card',       delay: true },
            { selector: '.matrix-item',          delay: true },
            { selector: '.resource-card',        delay: true },
            { selector: '.wave-divider',         delay: false },
        ];

        revealTargets.forEach(({ selector, delay }) => {
            document.querySelectorAll(selector).forEach((el, i) => {
                if (el) {
                    el.classList.add('reveal');
                    if (delay && i < 6) el.classList.add(`reveal-delay-${(i % 4) + 1}`);
                }
            });
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal').forEach(el => {
            if (el) observer.observe(el);
        });
    } catch (err) {
        console.error('Error initializing scroll reveal:', err);
    }
}

// Liquid ripple on button clicks
function initRippleEffect() {
    try {
        document.addEventListener('click', (e) => {
            const btn = e.target ? e.target.closest('.btn') : null;
            if (!btn) return;

            const circle = document.createElement('span');
            circle.classList.add('ripple-circle');
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            circle.style.width = circle.style.height = size + 'px';
            circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
            circle.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
            btn.appendChild(circle);
            circle.addEventListener('animationend', () => circle.remove());
        });
    } catch (err) {
        console.error('Error in ripple effect listener:', err);
    }
}

// Programmes Sub-Tabs Switching Helper
function initProgrammeSubTabs() {
    try {
        const subTabButtons = document.querySelectorAll('.sub-tab-btn');
        subTabButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    const targetProg = btn.getAttribute('data-prog');
                    if (targetProg) openProgram(targetProg);
                });
            }
        });
    } catch (err) {
        console.error('Error initializing programme sub-tabs:', err);
    }
}

function openProgram(progId) {
    try {
        const subTabButtons = document.querySelectorAll('.sub-tab-btn');
        const programPanes = document.querySelectorAll('.prog-detail-pane');

        subTabButtons.forEach(btn => {
            if (btn && btn.getAttribute('data-prog') === progId) {
                btn.classList.add('active');
            } else if (btn) {
                btn.classList.remove('active');
            }
        });

        programPanes.forEach(pane => {
            if (pane && pane.id === `prog-${progId}`) {
                pane.classList.add('active');
            } else if (pane) {
                pane.classList.remove('active');
            }
        });
        
        if (typeof switchView === 'function') switchView('programmes');
    } catch (err) {
        console.error('Error opening program:', err);
        if (typeof switchView === 'function') switchView('programmes');
    }
}

// Eco Village Zonal Tab Switching Helper
function initVillageTabs() {
    try {
        const villageTabButtons = document.querySelectorAll('.village-tab-btn');
        const villageZones = document.querySelectorAll('.village-zone-pane');

        villageTabButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    const zoneId = btn.getAttribute('data-zone');
                    
                    villageTabButtons.forEach(b => { if (b) b.classList.remove('active'); });
                    btn.classList.add('active');
                    
                    villageZones.forEach(pane => {
                        if (pane && pane.id === `zone-${zoneId}`) {
                            pane.classList.add('active');
                        } else if (pane) {
                            pane.classList.remove('active');
                        }
                    });
                });
            }
        });
    } catch (err) {
        console.error('Error initializing village tabs:', err);
    }
}

// Accordion toggle helper
function toggleAccordion(button) {
    try {
        if (!button || !button.parentElement || !button.parentElement.parentElement) return;
        const activeHeader = button.parentElement.parentElement.querySelector('.accordion-header.active');
        if (activeHeader && activeHeader !== button) {
            activeHeader.classList.remove('active');
            if (activeHeader.nextElementSibling) activeHeader.nextElementSibling.classList.remove('show');
        }
        
        button.classList.toggle('active');
        const content = button.nextElementSibling;
        if (content) content.classList.toggle('show');
    } catch (err) {
        console.error('Error toggling accordion:', err);
    }
}

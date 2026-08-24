// Green Rising Barbados — Main App Entry Point & Orchestrator

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initMobileMenu();
    initProgrammeSubTabs();
    initVillageTabs();
    if (typeof initResourcesHub === 'function') initResourcesHub();
    if (typeof initImpactMetrics === 'function') initImpactMetrics();
    if (typeof initSchedulesModule === 'function') initSchedulesModule();
    if (typeof initAdminTabsModules === 'function') initAdminTabsModules();
    initHashRouter();
    initScrollReveal();
    initRippleEffect();
});

// Scroll-triggered reveal animations
function initScrollReveal() {
    const revealTargets = [
        { selector: '.program-card', delay: true },
        { selector: '.stat-item', delay: true },
        { selector: '.village-card', delay: true },
        { selector: '.matrix-item', delay: true },
        { selector: '.pinelands-card', delay: true },
        { selector: '.dash-metric-card', delay: true }
    ];

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.12
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealTargets.forEach(target => {
            const elements = document.querySelectorAll(target.selector);
            elements.forEach((el, index) => {
                el.classList.add('reveal-on-scroll');
                if (target.delay) {
                    el.style.transitionDelay = `${(index % 4) * 0.12}s`;
                }
                observer.observe(el);
            });
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('.program-card, .stat-item, .village-card, .matrix-item, .pinelands-card, .dash-metric-card')
            .forEach(el => el.classList.add('revealed'));
    }
}

// Button ripple feedback effect
function initRippleEffect() {
    document.querySelectorAll('.btn-primary, .btn-secondary, .program-card, .team-filter-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const circle = document.createElement('span');
            const diameter = Math.max(rect.width, rect.height);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - rect.left - radius}px`;
            circle.style.top = `${e.clientY - rect.top - radius}px`;
            circle.classList.add('ripple-circle');

            this.querySelectorAll('.ripple-circle, .ripple').forEach(el => el.remove());
            this.appendChild(circle);

            setTimeout(() => {
                circle.remove();
            }, 600);
        });
    });
}

// Global Accordions helper
function toggleAccordion(button) {
    const content = button.nextElementSibling;
    const isShow = content.classList.contains('show');

    // Close all other accordion items in the same container
    const parent = button.closest('.accordion');
    if (parent) {
        parent.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));
        parent.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('show'));
    }

    if (!isShow) {
        button.classList.add('active');
        content.classList.add('show');
    }
}

// Smooth scrolling for internal anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            const targetId = href.substring(1);
            const targetEl = document.getElementById(`view-${targetId}`) || document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Green Rising Hero Information Dropdown Toggle
function toggleGreenRisingInfo(btnEl) {
    const contentPanel = document.getElementById('green-rising-info-panel');
    if (!contentPanel) return;
    const isHidden = contentPanel.classList.contains('hidden');
    if (isHidden) {
        contentPanel.classList.remove('hidden');
        if (btnEl) {
            btnEl.classList.add('active');
            btnEl.setAttribute('aria-expanded', 'true');
        }
    } else {
        contentPanel.classList.add('hidden');
        if (btnEl) {
            btnEl.classList.remove('active');
            btnEl.setAttribute('aria-expanded', 'false');
        }
    }
}
window.toggleGreenRisingInfo = toggleGreenRisingInfo;

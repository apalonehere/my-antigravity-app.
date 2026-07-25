// Green Rising Barbados — Main App Entry Point & Orchestrator

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initMobileMenu();
    initProgrammeSubTabs();
    initVillageTabs();
    initHashRouter();
    initScrollReveal();
    initRippleEffect();
});

// Scroll-triggered reveal animations
function initScrollReveal() {
    const revealTargets = [
        { selector: '.program-card',         delay: true },
        { selector: '.home-impact-brief',    delay: false },
        { selector: '.stat-item',            delay: true },
        { selector: '.glass',                delay: false },
        { selector: '.pinelands-card',       delay: true },
        { selector: '.matrix-item',          delay: true },
        { selector: '.wave-divider',         delay: false },
    ];

    revealTargets.forEach(({ selector, delay }) => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add('reveal');
            if (delay && i < 6) el.classList.add(`reveal-delay-${(i % 4) + 1}`);
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Liquid ripple on button clicks
function initRippleEffect() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
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
}

// Programmes Sub-Tabs Switching Helper
function initProgrammeSubTabs() {
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    subTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetProg = btn.getAttribute('data-prog');
            openProgram(targetProg);
        });
    });
}

function openProgram(progId) {
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    const programPanes = document.querySelectorAll('.prog-detail-pane');

    subTabButtons.forEach(btn => {
        if (btn.getAttribute('data-prog') === progId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    programPanes.forEach(pane => {
        if (pane.id === `prog-${progId}`) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });
    
    switchView('programmes');
}

// Eco Village Zonal Tab Switching Helper
function initVillageTabs() {
    const villageTabButtons = document.querySelectorAll('.village-tab-btn');
    const villageZones = document.querySelectorAll('.village-zone-pane');

    villageTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const zoneId = btn.getAttribute('data-zone');
            
            villageTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            villageZones.forEach(pane => {
                if (pane.id === `zone-${zoneId}`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });
}

// Accordion toggle helper
function toggleAccordion(button) {
    const activeHeader = button.parentElement.parentElement.querySelector('.accordion-header.active');
    if (activeHeader && activeHeader !== button) {
        activeHeader.classList.remove('active');
        activeHeader.nextElementSibling.classList.remove('show');
    }
    
    button.classList.toggle('active');
    const content = button.nextElementSibling;
    if (content) content.classList.toggle('show');
}

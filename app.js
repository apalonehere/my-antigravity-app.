// Green Rising Barbados - Config & Interactivity Script

// Paste your deployed Google Apps Script Web App URL here to connect the registration form to a Google Sheet:
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw7_Ferq7x7ULlFjHsOwSTihGYAU_qPqlPMzBKnEhT_J2hNxy5B70wNM3OqHiiEhyY5/exec'; 

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

// --- Theme Switcher (Light / Dark Mode) ---
function initTheme() {
    const savedTheme = localStorage.getItem('green-rising-theme');
    const toggleBtn = document.getElementById('theme-toggle-btn');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (toggleBtn) toggleBtn.innerText = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (toggleBtn) toggleBtn.innerText = '🌙';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const toggleBtn = document.getElementById('theme-toggle-btn');
    
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('green-rising-theme', 'light');
        if (toggleBtn) toggleBtn.innerText = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('green-rising-theme', 'dark');
        if (toggleBtn) toggleBtn.innerText = '☀️';
    }
}

// --- Organic/Fluid: Scroll-triggered reveal animations ---
function initScrollReveal() {
    // Add reveal class to key elements
    const revealTargets = [
        { selector: '.program-card',         delay: true },
        { selector: '.home-impact-brief',    delay: false },
        { selector: '.stat-item',            delay: true },
        { selector: '.glass',                delay: false },
        { selector: '.pinelands-card',       delay: true },
        { selector: '.matrix-item',          delay: true },
        { selector: '.team-card',            delay: true },
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

// --- Organic/Fluid: Liquid ripple on button clicks ---
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

// --- 1. SPA Navigation & Router ---
const views = document.querySelectorAll('.app-view');
const navLinks = document.querySelectorAll('.nav-link');

function initNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const tabId = link.getAttribute('data-tab');
            if (tabId) {
                // If it's a link to a main tab view
                e.preventDefault();
                switchView(tabId);
                window.location.hash = tabId;
            }
        });
    });
}

function switchView(viewId) {
    if (viewId === 'team') {
        // Show home view and scroll directly to team section
        views.forEach(view => {
            if (view.id === 'view-home') {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });
        navLinks.forEach(link => {
            if (link.getAttribute('data-tab') === 'team') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        const teamSection = document.getElementById('home-team-section');
        if (teamSection) {
            teamSection.scrollIntoView({ behavior: 'smooth' });
        }
        return;
    }

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

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Router using hash location
function initHashRouter() {
    const handleHash = () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            // Check if it's a focus area program
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

// --- 2. Mobile Navigation Toggle ---
function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-toggle-btn');
    const mainNav = document.getElementById('main-navigation');

    if (toggleBtn && mainNav) {
        toggleBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });

        // Close menu when clicking link
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
            });
        });
    }
}

// --- 3. Sub-Tab Switching (Programmes Detail View) ---
function initProgrammeSubTabs() {
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    const progPanes = document.querySelectorAll('.prog-detail-pane');

    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetProg = btn.getAttribute('data-prog');

            subTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            progPanes.forEach(pane => {
                if (pane.id === `prog-${targetProg}`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });
}

function openProgram(progId) {
    switchView('programmes');
    window.location.hash = 'programmes';

    const subTabBtn = document.querySelector(`.sub-tab-btn[data-prog="${progId}"]`);
    if (subTabBtn) {
        subTabBtn.click();
    }
}

// --- 4. Eco Village Zone Switching ---
function initVillageTabs() {
    const zoneBtns = document.querySelectorAll('.village-tab-btn');
    const zonePanes = document.querySelectorAll('.village-zone-pane');

    zoneBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetZone = btn.getAttribute('data-zone');

            zoneBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            zonePanes.forEach(pane => {
                if (pane.id === `zone-${targetZone}`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });
}

// --- 5. Interactive Water Consumption Calculator ---
function calculateWater() {
    const residents = parseInt(document.getElementById('calc-residents').value) || 1;
    const showerMins = parseInt(document.getElementById('calc-shower').value) || 5;
    const hasLeaks = document.getElementById('calc-leaks').value === 'yes';

    // Standard estimates: 2.1 gallons per shower min + base daily usage + leak offset
    let dailyPerPerson = (showerMins * 2.1) + 25; // 25 gallons baseline (flushes, sinks)
    let totalDaily = Math.round(dailyPerPerson * residents);

    if (hasLeaks) {
        totalDaily += 20; // 20 gal/day loss for typical drip/toilet leak
    }

    // Potential savings with Green Rising checklist (~30%)
    const potentialSaved = Math.round(totalDaily * 0.30);

    document.getElementById('water-use-val').innerText = totalDaily.toLocaleString();
    document.getElementById('water-saved-val').innerText = potentialSaved.toLocaleString();

    document.getElementById('calc-results-box').classList.remove('hidden');
}

// --- 6. Pinelands Interactive Career Path Wizard ---
let wizardAnswers = {};

function nextWizardStep(choice) {
    wizardAnswers.step1 = choice;
    document.getElementById('wiz-step-1').classList.add('hidden');
    document.getElementById('wiz-step-2').classList.remove('hidden');
}

function finishWizard(choice) {
    wizardAnswers.step2 = choice;
    document.getElementById('wiz-step-2').classList.add('hidden');
    document.getElementById('wiz-result').classList.remove('hidden');

    if (choice === 'green' || wizardAnswers.step1 === 'outdoor') {
        resultTitle.innerText = "Zone 3: Build the Future & Eco-Village";
        resultDesc.innerText = "You show strong potential in sustainable infrastructure, disaster-resilient engineering, and marine conservation.";
    } else if (choice === 'digital' || wizardAnswers.step1 === 'office') {
        resultTitle.innerText = "Zone 4: Tech & Digital (Work Without Borders)";
        resultDesc.innerText = "Your interests align with global remote work, digital branding, climate software monitoring, and technology careers.";
    } else {
        resultTitle.innerText = "Zone 2: Entrepreneurship & Micro-Enterprise";
        resultDesc.innerText = "You excel at innovation and business building. Our micro-grant and enterprise incubator paths fit your profile best.";
    }
}

function resetWizard() {
    wizardAnswers = {};
    document.getElementById('wiz-result').classList.add('hidden');
    document.getElementById('wiz-step-2').classList.add('hidden');
    document.getElementById('wiz-step-1').classList.remove('hidden');
}

// --- 7. Interactive Quiz Logic ---
function quizNext(stepNum) {
    document.querySelectorAll('.quiz-step-pane').forEach(p => p.classList.add('hidden'));
    document.getElementById(`q-step-${stepNum}`).classList.remove('hidden');
}

function processQuizResults() {
    const ageGroup = document.querySelector('input[name="age-group"]:checked')?.value || 'youth';
    const interest = document.querySelector('input[name="interest"]:checked')?.value || 'water';

    document.querySelectorAll('.quiz-step-pane').forEach(p => p.classList.add('hidden'));
    const resultPane = document.getElementById('q-result');
    resultPane.classList.remove('hidden');

    const titleEl = document.getElementById('matched-title');
    const descEl = document.getElementById('matched-description');
    const ctaEl = document.getElementById('quiz-cta');

    if (interest === 'marine' || ageGroup === 'youth') {
        titleEl.innerText = "Youth of the Seas (YOTS) Boat Building";
        descEl.innerText = "You are an ideal match for our 12-week maritime craft engineering cohort. Gain certified skills building resilient vessels.";
        ctaEl.setAttribute('onclick', "openApplyForm('Youth of the Seas')");
    } else if (interest === 'water') {
        titleEl.innerText = "Water Conservation Community Action";
        descEl.innerText = "You match our island water monitoring team! Help audit residential leakages and install rainwater harvesting tools.";
        ctaEl.setAttribute('onclick', "openApplyForm('Water Conservation')");
    } else if (interest === 'green') {
        titleEl.innerText = "Eco Village & CYEN Skills";
        descEl.innerText = "You qualify for our sustainable agriculture, hydroponics, and soil remediation training modules.";
        ctaEl.setAttribute('onclick', "openApplyForm('Eco Village')");
    } else {
        titleEl.innerText = "Pinelands Career Pavilion";
        descEl.innerText = "Explore our 6 vocational innovation zones spanning digital tech, micro-enterprise, and global scholarships.";
        ctaEl.setAttribute('onclick', "openApplyForm('Pinelands Career Pavilion')");
    }
}

function resetQuiz() {
    document.getElementById('q-result').classList.add('hidden');
    document.querySelectorAll('.quiz-step-pane').forEach(p => p.classList.add('hidden'));
    document.getElementById('q-step-1').classList.remove('hidden');
}

// --- 8. Public Impact Hub Admin Update Simulation ---
function simulateAdminUpdate() {
    const youthVal = document.getElementById('admin-youth').value;
    const waterVal = parseInt(document.getElementById('admin-water').value).toLocaleString();
    const boatsVal = document.getElementById('admin-boats').value;
    const jobsVal = document.getElementById('admin-jobs').value;

    // Update Dashboard values
    document.getElementById('dash-stat-youth').innerText = youthVal;
    document.getElementById('dash-stat-water').innerText = waterVal;
    document.getElementById('dash-stat-boats').innerText = boatsVal;
    document.getElementById('dash-stat-jobs').innerText = jobsVal;

    // Update Home page brief values
    document.getElementById('brief-stat-youth').innerText = youthVal;
    document.getElementById('brief-stat-water').innerText = waterVal;
    document.getElementById('brief-stat-boats').innerText = boatsVal;
    document.getElementById('brief-stat-jobs').innerText = jobsVal;

    const statusBox = document.getElementById('sim-status-box');
    statusBox.classList.remove('hidden');
    setTimeout(() => {
        statusBox.classList.add('hidden');
    }, 4000);
}

// --- 9. Application Form Logic ---
function openApplyForm(progName) {
    switchView('apply');
    window.location.hash = 'apply';

    const selectEl = document.getElementById('apply-prog');
    if (selectEl && progName) {
        for (let i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i].text.toLowerCase().includes(progName.toLowerCase())) {
                selectEl.selectedIndex = i;
                break;
            }
        }
    }
}

function handleApplySubmit() {
    const fname = document.getElementById('apply-fname').value;
    const lname = document.getElementById('apply-lname').value;
    const email = document.getElementById('apply-email').value;
    const phone = document.getElementById('apply-phone').value;
    const age = document.getElementById('apply-age').value;
    const progSelect = document.getElementById('apply-prog');
    const programme = progSelect.options[progSelect.selectedIndex].text;
    const district = document.getElementById('apply-district').value;

    const formData = {
        timestamp: new Date().toISOString(),
        firstName: fname,
        lastName: lname,
        email: email,
        phone: phone,
        age: age,
        programme: programme,
        district: district
    };

    // If a Google Sheets URL is configured, send the data
    if (GOOGLE_SHEETS_URL) {
        const submitBtn = document.querySelector('#apply-form button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting...';

        fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors', // standard workaround for App Script redirections without CORS headers
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(() => {
            showSuccessState();
        })
        .catch(err => {
            console.error('Error submitting to Google Sheet:', err);
            // Fallback: show success anyway in prototype, but log error
            showSuccessState();
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        });
    } else {
        // Default prototype behaviour
        console.warn('Google Sheets URL not configured. Submitting form locally only.');
        showSuccessState();
    }
}

function showSuccessState() {
    document.getElementById('apply-form').classList.add('hidden');
    document.getElementById('apply-success-box').classList.remove('hidden');
    document.getElementById('view-apply').scrollIntoView({ behavior: 'smooth' });
}

function resetApplyForm() {
    document.getElementById('apply-form').reset();
    document.getElementById('apply-form').classList.remove('hidden');
    document.getElementById('apply-success-box').classList.add('hidden');
}

// --- Meet the Team Category Filter ---
function filterTeam(category, btnElement) {
    const filterButtons = document.querySelectorAll('.team-filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
            card.style.display = 'flex';
            card.style.animation = 'viewFadeIn 0.4s var(--ease-smooth)';
        } else {
            card.style.display = 'none';
        }
    });
}

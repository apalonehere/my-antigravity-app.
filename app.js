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
    applyTheme(savedTheme === 'dark');
}

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
}

function applyTheme(isDark) {
    const togglePills = document.querySelectorAll('.theme-toggle-pill');
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('green-rising-theme', 'dark');
        togglePills.forEach(pill => {
            pill.innerHTML = '☀️ <span class="theme-text">Light Mode</span>';
        });
        toggleBtns.forEach(btn => {
            btn.innerText = '☀️';
        });
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('green-rising-theme', 'light');
        togglePills.forEach(pill => {
            pill.innerHTML = '🌙 <span class="theme-text">Dark Mode</span>';
        });
        toggleBtns.forEach(btn => {
            btn.innerText = '🌙';
        });
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
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
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
    const views = document.querySelectorAll('.app-view');
    const navLinks = document.querySelectorAll('.nav-link');

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
    // Initial check on load
    handleHash();
}

// Mobile navigation hamburger toggle
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobile-toggle-btn');
    const mainNav = document.getElementById('main-navigation');
    
    if (mobileBtn && mainNav) {
        mobileBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileBtn.classList.toggle('open');
        });
        
        // Close menu on click of nav link
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                mobileBtn.classList.remove('open');
            });
        });
    }
}

// --- 2. Programmes Sub-Tabs Switching ---
const subTabButtons = document.querySelectorAll('.sub-tab-btn');
const programPanes = document.querySelectorAll('.prog-detail-pane');

function initProgrammeSubTabs() {
    subTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetProg = btn.getAttribute('data-prog');
            openProgram(targetProg);
        });
    });
}

function openProgram(progId) {
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

// --- 3. Eco Village Zonal Tab Switching ---
const villageTabButtons = document.querySelectorAll('.village-tab-btn');
const villageZones = document.querySelectorAll('.village-zone-pane');

function initVillageTabs() {
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

// Accordion toggle helper (used in CYEN Skills section)
function toggleAccordion(button) {
    const activeHeader = button.parentElement.parentElement.querySelector('.accordion-header.active');
    if (activeHeader && activeHeader !== button) {
        activeHeader.classList.remove('active');
        activeHeader.nextElementSibling.classList.remove('show');
    }
    
    button.classList.toggle('active');
    const content = button.nextElementSibling;
    content.classList.toggle('show');
}

// --- 4. Water Conservation Calculator Logic ---
function calculateWater() {
    const residents = parseInt(document.getElementById('calc-residents').value) || 1;
    const showerLength = parseInt(document.getElementById('calc-shower').value) || 8;
    const hasLeaks = document.getElementById('calc-leaks').value === 'yes';
    
    // Normal consumption formulas
    const baseUse = residents * 50; // average gallons base per person
    const showerUse = residents * showerLength * 2; // ~2 gallons/minute
    const leakUse = hasLeaks ? 35 : 0; // average toilet/drip leak gallons
    
    const dailyTotal = baseUse + showerUse + leakUse;
    
    // Potential savings
    let showerSavings = 0;
    if (showerLength > 5) {
        // Savings if shower reduced to 5 mins
        showerSavings = residents * (showerLength - 5) * 2;
    }
    const leakSavings = hasLeaks ? 35 : 0;
    const efficiencySavings = residents * 8; // efficient taps/shower heads
    
    const totalSaved = showerSavings + leakSavings + efficiencySavings;
    
    // Display results with animation
    const resultsBox = document.getElementById('calc-results-box');
    resultsBox.classList.remove('hidden');
    
    animateValue('water-use-val', Math.round(dailyTotal), 800);
    animateValue('water-saved-val', Math.round(totalSaved), 800);
}

// Count-up numerical animation supporting current value transition
function animateValue(id, end, duration = 1000) {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    const rawCurrent = obj.innerText ? obj.innerText.replace(/[^0-9]/g, '') : '0';
    const start = parseInt(rawCurrent) || 0;
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = Math.floor(progress * (end - start) + start);
        obj.innerHTML = currentVal.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// --- 5. Pinelands Career Path Wizard ---
let wizardAnswers = {};

function nextWizardStep(choice) {
    wizardAnswers.step1 = choice;
    document.getElementById('wiz-step-1').classList.add('hidden');
    document.getElementById('wiz-step-2').classList.remove('hidden');
}

function finishWizard(choice) {
    wizardAnswers.step2 = choice;
    document.getElementById('wiz-step-2').classList.add('hidden');
    
    const resultBox = document.getElementById('wiz-result');
    const resultTitle = document.getElementById('wiz-result-title');
    const resultDesc = document.getElementById('wiz-result-desc');
    
    resultBox.classList.remove('hidden');
    
    // Matching algorithm
    if (wizardAnswers.step1 === 'outdoor' && wizardAnswers.step2 === 'green') {
        resultTitle.innerText = "Zone 3: Build the Future & Zone 1";
        resultDesc.innerText = "You are a natural fit for sustainability engineering, eco-village farming, or resilient boat construction. Your path aligns with climate mitigation!";
    } else if (wizardAnswers.step1 === 'outdoor' && wizardAnswers.step2 === 'business') {
        resultTitle.innerText = "Zone 6: Sports & Performance";
        resultDesc.innerText = "Your interests lead toward coastal stewardship, sports leadership, ocean diving charters, or performance arts administration.";
    } else if (wizardAnswers.step1 === 'office' && wizardAnswers.step2 === 'digital') {
        resultTitle.innerText = "Zone 4: Tech & Digital";
        resultDesc.innerText = "You align perfectly with high-growth digital arenas. Remote work, media design, software engineering, and global digital markets fit your path.";
    } else if (wizardAnswers.step2 === 'digital') {
        resultTitle.innerText = "Zone 4: Tech & Digital";
        resultDesc.innerText = "Global tech connections, digital marketing, and remote services represent your fastest pathway to modern job creation.";
    } else {
        resultTitle.innerText = "Zone 2: Entrepreneurship & Emerging Markets";
        resultDesc.innerText = "You show high potential for starting local businesses, managing creative industries, launching wellness services, or farming cooperatives.";
    }
}

function resetWizard() {
    wizardAnswers = {};
    document.getElementById('wiz-result').classList.add('hidden');
    document.getElementById('wiz-step-2').classList.add('hidden');
    document.getElementById('wiz-step-1').classList.remove('hidden');
}

// --- 6. Impact Dashboard Interactive Tab Switcher & Admin Updates ---
function switchDashTab(tabId, btnEl) {
    const dashBtns = document.querySelectorAll('.dash-tab-btn');
    const dashPanes = document.querySelectorAll('.dash-pane');

    dashBtns.forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    dashPanes.forEach(pane => {
        if (pane.id === `dash-tab-${tabId}`) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });
}

const metrics = {
    youth: 242,
    water: 85210,
    boats: 4,
    jobs: 32
};

function simulateAdminUpdate() {
    const inputYouth = parseInt(document.getElementById('admin-youth').value) || metrics.youth;
    const inputWater = parseInt(document.getElementById('admin-water').value) || metrics.water;
    const inputBoats = parseInt(document.getElementById('admin-boats').value) || metrics.boats;
    const inputJobs = parseInt(document.getElementById('admin-jobs').value) || metrics.jobs;
    
    // Save to local state
    metrics.youth = inputYouth;
    metrics.water = inputWater;
    metrics.boats = inputBoats;
    metrics.jobs = inputJobs;
    
    // Trigger count-up transitions for 4-Grid Dashboard Metric Cards
    animateValue('dash-stat-youth', metrics.youth, 1000);
    animateValue('dash-stat-water', metrics.water, 1000);
    animateValue('dash-stat-boats', metrics.boats, 1000);
    animateValue('dash-stat-jobs', metrics.jobs, 1000);

    // Trigger count-up transitions for Hero Card Inline Stats
    animateValue('dash-hero-youth', metrics.youth, 1000);
    animateValue('dash-hero-water', metrics.water, 1000);
    animateValue('dash-hero-jobs', metrics.jobs, 1000);
    
    // Trigger count-up transitions for Homepage Brief Stats Strip
    animateValue('brief-stat-youth', metrics.youth, 1000);
    animateValue('brief-stat-water', metrics.water, 1000);
    animateValue('brief-stat-boats', metrics.boats, 1000);
    animateValue('brief-stat-jobs', metrics.jobs, 1000);
    
    // Dynamically calculate and update target percentage gauge
    const targetPct = Math.min(Math.round((metrics.youth / 300) * 100), 100);
    const ringValEl = document.getElementById('dash-ring-val');
    const ringFillEl = document.getElementById('dash-ring-fill');
    if (ringValEl) ringValEl.innerText = `${targetPct}%`;
    if (ringFillEl) {
        const offset = 264 - (264 * (targetPct / 100));
        ringFillEl.style.strokeDashoffset = offset;
    }

    // Dynamically adjust environmental monitor indicators
    const estimatedCO2 = (metrics.youth * 0.05).toFixed(1);
    const estimatedCoast = (metrics.youth * 0.005).toFixed(2);
    const estimatedSoil = (metrics.youth * 0.035).toFixed(1);
    const estimatedRain = Math.max(8, Math.round(metrics.youth * 0.065));

    const carbonEl = document.getElementById('dash-carbon');
    const coastEl = document.getElementById('dash-coastline');
    const soilEl = document.getElementById('dash-soil');
    const rainEl = document.getElementById('dash-rain');

    if (carbonEl) carbonEl.innerText = `${estimatedCO2} Tons`;
    if (coastEl) coastEl.innerText = `${estimatedCoast} km`;
    if (soilEl) soilEl.innerText = `${estimatedSoil} Acres`;
    if (rainEl) rainEl.innerText = `${estimatedRain} Systems`;
    
    // Show success notification banner
    const alertBox = document.getElementById('sim-status-box');
    if (alertBox) {
        alertBox.classList.remove('hidden');
        setTimeout(() => {
            alertBox.classList.add('hidden');
        }, 4000);
    }
}

// --- 7. Eligibility Match Quiz ---
let quizAnswers = {};

function quizNext(step) {
    // Hide all steps
    document.getElementById('q-step-1').classList.add('hidden');
    document.getElementById('q-step-2').classList.add('hidden');
    document.getElementById('q-step-3').classList.add('hidden');
    document.getElementById('q-result').classList.add('hidden');
    
    // Show selected step
    document.getElementById(`q-step-${step}`).classList.remove('hidden');
}

function processQuizResults() {
    const ageVal = document.querySelector('input[name="age-group"]:checked').value;
    const interestVal = document.querySelector('input[name="interest"]:checked').value;
    const statusVal = document.querySelector('input[name="status"]:checked').value;
    
    const resultPane = document.getElementById('q-result');
    const matchedTitle = document.getElementById('matched-title');
    const matchedDesc = document.getElementById('matched-description');
    const quizCta = document.getElementById('quiz-cta');
    
    // Hide questions
    document.getElementById('q-step-3').classList.add('hidden');
    resultPane.classList.remove('hidden');
    
    // Recommendation mapping
    if (ageVal === 'kids') {
        matchedTitle.innerText = "CYEN Skills - Eco-Explorers";
        matchedDesc.innerText = "For ages 10-13, our CYEN partnership provides eco-exploration, recycling games, and climate literacy workshops. A fun, safe, hands-on path for young leaders.";
        quizCta.setAttribute('onclick', "openApplyForm('cyen')");
    } else if (interestVal === 'boats' && ageVal === 'youth') {
        matchedTitle.innerText = "Youth of the Seas (YOTS) Boat Building";
        matchedDesc.innerText = "Based on your interest in craftsmanship and marine sectors, you qualify for our 12-week Cohort intake. Build disaster-resilient vessels and learn engine repair.";
        quizCta.setAttribute('onclick', "openApplyForm('yots')");
    } else if (interestVal === 'water') {
        matchedTitle.innerText = "Water Conservation Initiative";
        matchedDesc.innerText = "Your interests fit our community-led water saving action. Participate in household checkups, monitoring systems, and local awareness campaigns.";
        quizCta.setAttribute('onclick', "openApplyForm('water')");
    } else if (interestVal === 'business') {
        matchedTitle.innerText = "Eco Village: Earn & Grow Zonal Pathway";
        matchedDesc.innerText = "You align with sustainable agri-business, crop marketing, and hydroponics. Learn how to launch your own food security micro-enterprise.";
        quizCta.setAttribute('onclick', "openApplyForm('ecovillage')");
    } else {
        matchedTitle.innerText = "Pinelands Pavilion: Career Discovery";
        matchedDesc.innerText = "We recommend joining the Pinelands exploration days. Explore sports performance, global studies, remote digital skills, and wellness markets.";
        quizCta.setAttribute('onclick', "openApplyForm('pinelands')");
    }
}

function resetQuiz() {
    quizNext(1);
}

// --- 8. Application Form Submission Simulation ---
function openApplyForm(progName) {
    switchView('apply');
    const progSelect = document.getElementById('apply-prog');
    
    // Map string identifiers to selector values
    if (progName === 'yots' || progName.includes('Seas')) {
        progSelect.value = 'yots';
    } else if (progName === 'cyen' || progName.includes('CYEN')) {
        progSelect.value = 'cyen';
    } else if (progName === 'water' || progName.includes('Water')) {
        progSelect.value = 'water';
    } else if (progName === 'ecovillage' || progName.includes('Village')) {
        progSelect.value = 'ecovillage';
    } else {
        progSelect.value = 'pinelands';
    }
}

function handleApplySubmit() {
    const formData = {
        firstName: document.getElementById('apply-fname').value,
        lastName: document.getElementById('apply-lname').value,
        email: document.getElementById('apply-email').value,
        phone: document.getElementById('apply-phone').value,
        age: parseInt(document.getElementById('apply-age').value),
        programme: document.getElementById('apply-prog').value,
        district: document.getElementById('apply-district').value
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
    filterButtons.forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(`'${category}'`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

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

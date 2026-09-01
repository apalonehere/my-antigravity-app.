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
    if (typeof initHTML5Router === 'function') initHTML5Router();
    else if (typeof initHashRouter === 'function') initHashRouter();
    initScrollReveal();
    initRippleEffect();
});

// Scroll-triggered reveal animations
// .reel-card, .snap-card and .pillar-visual-card are deliberately absent:
// js/motion.js reveals those with GSAP, and running both systems on the same
// element leaves it fighting over opacity and transform.
// ('.who-bento-card' used to be listed here; that class no longer exists.)
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

// --- Video Spotlight Modal & Player Controller ---
// `desc` is intentionally empty: the previous descriptions were written without
// reference to the footage and did not describe what the videos actually show.
// The modal hides the line while it is blank — fill one in once the real
// content of each reel is confirmed.
const VIDEO_REELS_DATA = {
    video1: {
        category: '🚌 Field Trip',
        title: 'Eco-Ride Bus Trip',
        desc: '',
        videoSrc: 'images/video1.mp4',
        poster: 'images/eco-leaders.jpg'
    },
    video2: {
        category: '🐟 Conference',
        title: 'Aqua-Producers Conference',
        desc: '',
        videoSrc: 'images/video2.mp4',
        poster: 'images/eco-leaders.jpg'
    },
    video3: {
        category: '🌱 Workshop',
        title: 'Eco-Leaders Workshop',
        desc: '',
        videoSrc: 'images/video3.mp4',
        poster: 'images/eco-leaders.jpg'
    }
};

let modalVideoProgressInterval = null;
let isModalVideoPlaying = false;
let currentReelKey = 'video1';

const REEL_ORDER = ['video1', 'video2', 'video3'];

function updateReelCounter() {
    const el = document.getElementById('modal-reel-count');
    const nav = document.querySelector('.reel-nav');
    if (!el) return;

    const i = REEL_ORDER.indexOf(currentReelKey);

    // Other videos open in this same modal (the Tomorrow's Reef film, for one).
    // They are not part of the reel run, so hide the counter and the arrows
    // rather than showing a misleading "1 / 3" and stepping into the reels.
    if (i < 0) {
        if (nav) nav.style.display = 'none';
        return;
    }
    if (nav) nav.style.display = '';
    el.textContent = `${i + 1} / ${REEL_ORDER.length}`;
}

// Move between reels without closing the modal — wraps at both ends
function stepVideoModal(delta) {
    const i = REEL_ORDER.indexOf(currentReelKey);
    if (i < 0) return; // not in the reel run; nothing to step through
    const next = REEL_ORDER[((i + delta) % REEL_ORDER.length + REEL_ORDER.length) % REEL_ORDER.length];
    openVideoModal(next);
}
window.stepVideoModal = stepVideoModal;

// A modal needs a way out that isn't the mouse, and arrow keys are the
// expected way to move through a reel player.
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('video-reel-modal');
    if (!modal || modal.getAttribute('aria-hidden') !== 'false') return;

    if (e.key === 'Escape') {
        e.preventDefault();
        closeVideoModal();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepVideoModal(1);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepVideoModal(-1);
    }
});

function openVideoModal(type = 'video1') {
    const modal = document.getElementById('video-reel-modal');
    if (!modal) return;

    const data = VIDEO_REELS_DATA[type] || VIDEO_REELS_DATA.video1;
    const catEl = document.getElementById('modal-reel-category');
    const titleEl = document.getElementById('modal-reel-title');
    const descEl = document.getElementById('modal-reel-desc');
    const posterEl = document.getElementById('modal-video-poster');
    const videoTag = document.getElementById('modal-video-tag');
    const overlayControls = document.getElementById('modal-overlay-controls');
    const progressEl = document.getElementById('modal-video-progress');

    if (catEl) catEl.innerText = data.category;
    if (titleEl) titleEl.innerText = data.title;
    if (descEl) {
        // Collapse the line entirely when there is no description, rather than
        // leaving an empty paragraph holding vertical space
        descEl.innerText = data.desc || '';
        descEl.style.display = data.desc ? '' : 'none';
    }
    if (progressEl) progressEl.style.width = '0%';

    currentReelKey = VIDEO_REELS_DATA[type] ? type : 'video1';
    updateReelCounter();

    // Check if real video file exists / path set
    if (videoTag && data.videoSrc) {
        // These reels are shot vertically. Size the modal to the video's real
        // aspect ratio rather than cropping it into a landscape box.
        videoTag.onloadedmetadata = () => {
            if (videoTag.videoWidth && videoTag.videoHeight) {
                modal.style.setProperty('--reel-ar', videoTag.videoWidth / videoTag.videoHeight);
            }
        };
        videoTag.src = data.videoSrc;
        videoTag.style.display = 'block';
        if (posterEl) posterEl.style.display = 'none';
        if (overlayControls) overlayControls.style.display = 'none';
        videoTag.play().catch(() => {
            // Fallback to poster preview if video file is not yet copied or unsupported
            videoTag.style.display = 'none';
            if (posterEl) {
                posterEl.style.display = 'block';
                posterEl.src = data.poster || 'images/eco-leaders.jpg';
            }
            if (overlayControls) overlayControls.style.display = 'flex';
        });
    } else {
        if (videoTag) videoTag.style.display = 'none';
        if (posterEl) {
            posterEl.style.display = 'block';
            posterEl.src = data.poster || 'images/eco-leaders.jpg';
        }
        if (overlayControls) overlayControls.style.display = 'flex';
    }

    isModalVideoPlaying = false;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const modal = document.getElementById('video-reel-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    const videoTag = document.getElementById('modal-video-tag');
    if (videoTag) {
        videoTag.pause();
        videoTag.currentTime = 0;
    }

    if (modalVideoProgressInterval) {
        clearInterval(modalVideoProgressInterval);
        modalVideoProgressInterval = null;
    }
}

function toggleModalVideoPlay() {
    const progressEl = document.getElementById('modal-video-progress');
    const playBtn = document.getElementById('modal-play-btn');
    if (!progressEl) return;

    isModalVideoPlaying = !isModalVideoPlaying;

    if (isModalVideoPlaying) {
        if (playBtn) playBtn.style.opacity = '0.4';
        let currentWidth = parseFloat(progressEl.style.width) || 0;
        if (modalVideoProgressInterval) clearInterval(modalVideoProgressInterval);

        modalVideoProgressInterval = setInterval(() => {
            currentWidth += 1.5;
            if (currentWidth > 100) {
                currentWidth = 0;
                isModalVideoPlaying = false;
                if (playBtn) playBtn.style.opacity = '1';
                clearInterval(modalVideoProgressInterval);
            }
            progressEl.style.width = `${currentWidth}%`;
        }, 100);
    } else {
        if (playBtn) playBtn.style.opacity = '1';
        if (modalVideoProgressInterval) {
            clearInterval(modalVideoProgressInterval);
            modalVideoProgressInterval = null;
        }
    }
}

window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;
window.toggleModalVideoPlay = toggleModalVideoPlay;



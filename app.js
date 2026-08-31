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
        category: '🪸 Subsea Reef Action',
        title: 'Youth Underwater Reef Installation',
        desc: '',
        videoSrc: 'images/video1.mp4',
        poster: 'images/eco-leaders.jpg'
    },
    video2: {
        category: '⛵ Eco-Vessel Engineering',
        title: 'Building Solar Boats & Maritime Craft',
        desc: '',
        videoSrc: 'images/video2.mp4',
        poster: 'images/eco-leaders.jpg'
    },
    video3: {
        category: '🏃 Climate Dash 3K',
        title: 'Youth Sprinting for Planet & Ocean',
        desc: '',
        videoSrc: 'images/video3.mp4',
        poster: 'images/eco-leaders.jpg'
    }
};

let modalVideoProgressInterval = null;
let isModalVideoPlaying = false;

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

    // Check if real video file exists / path set
    if (videoTag && data.videoSrc) {
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



// Green Rising Barbados — Resources Hub Module

// Curated live resources dataset
const resourcesData = [
    {
        id: 1,
        title: "Eco-Leaders: Ideas to Impact Workshop",
        category: ["social", "workshop"],
        economy: "green",
        platform: "Instagram",
        readTime: "Instagram Reel • Watch",
        date: "June 2026",
        summary: "Ideas. Innovation. Action. Young people from across Barbados came together under UNICEF Eastern Caribbean to share their vision for a sustainable future through the Eco-Leaders: Ideas to Impact Workshop.",
        imageUrl: "/images/eco-leaders.jpg",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('/images/eco-leaders.jpg') center/cover no-repeat",
        link: "https://www.instagram.com/p/DZbEuNSD4ht/",
        actionLabel: "Watch on Instagram"
    },
    {
        id: 2,
        title: "Green Rising Initiative to Empower 12,000 Youth in Climate Action",
        category: "article",
        economy: "green",
        platform: "Barbados Today",
        readTime: "3 min read",
        date: "June 2025",
        summary: "$3M for Barbadian youth — funding and skills. From PM Mia Mottley, UNICEF and Generation Unlimited.",
        imageUrl: "/images/barbados-today-launch.jpg",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('/images/barbados-today-launch.jpg') center/cover no-repeat",
        link: "https://barbadostoday.bb/2025/06/21/green-rising-initiative-to-empower-12-000-youth-in-climate-action/",
        actionLabel: "Read on Barbados Today"
    },
    {
        id: 3,
        title: "Green Rising: Future Barbados & UNICEF on Youth Climate Action",
        category: "video",
        economy: "cross",
        platform: "YouTube",
        readTime: "Feature Interview",
        date: "June 2025",
        summary: "Mornin' Barbados interview featuring Tamaisha Eytle-Harvey (Future Barbados) and Nadi Albino (UNICEF) detailing climate entrepreneurship, youth advocacy, and community action programs.",
        imageUrl: "/images/youtube-interview-thumb.jpg",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('/images/youtube-interview-thumb.jpg') center/cover no-repeat",
        link: "https://www.youtube.com/watch?v=KTyOGM3BBoU",
        actionLabel: "Watch on YouTube"
    },
    {
        id: 4,
        title: "Green Rising Barbados: Official Instagram Channel",
        category: "social",
        economy: "cross",
        platform: "Instagram Profile",
        readTime: "Official Feed • 21 Posts",
        date: "Live Feed",
        summary: "Follow the official Green Rising Barbados Instagram channel (@greenrisingbarbados) for live cohort updates, youth climate action stories, event announcements, and island-wide field highlights.",
        imageUrl: "/images/logo.png",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('/images/logo.png') center/contain no-repeat",
        link: "https://www.instagram.com/greenrisingbarbados/",
        actionLabel: "Follow on Instagram"
    },
    {
        id: 5,
        title: "Barbados Launches National Green Rising Programme to Lead Youth-Driven Climate Action",
        category: "article",
        economy: "green",
        platform: "UNICEF",
        readTime: "4 min read",
        date: "June 2025",
        summary: "UNICEF's launch release. 5,000 Barbadian youth, green & blue business grants, environmental training. Announced by PM Mia Mottley.",
        imageUrl: "/images/Unicef green rising launch.png",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('/images/Unicef green rising launch.png') center/cover no-repeat",
        link: "https://www.unicef.org/easterncaribbean/press-releases/barbados-launches-national-green-rising-programme-lead-youth-driven-climate-action",
        actionLabel: "Read on UNICEF"
    },
    {
        id: 6,
        title: "Green Rising: Reflecting on Results, Reimagining the Future",
        category: "article",
        economy: "green",
        platform: "Generation Unlimited",
        readTime: "6 min read",
        date: "March 2026",
        summary: "GenU's flagship report. COP28 to COP30, 45 million young people, 40+ countries.",
        imageUrl: "/images/Green Rising History .png",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('/images/Green Rising History .png') center/cover no-repeat",
        link: "https://www.generationunlimited.org/green-rising-reflecting-results-reimagining-future",
        actionLabel: "Read GenU Report"
    },
    {
        id: 7,
        title: "The Presidents' Caucus: Student Agency & Leadership in Barbados",
        category: ["social", "workshop"],
        economy: "orange",
        platform: "Instagram",
        readTime: "Instagram Reel • Watch",
        date: "June 2026",
        summary: "Student leaders from across Barbados gathered for The Presidents' Caucus (@bnsc_official) to explore student voice, leadership in motion, and hands-on school community action.",
        imageUrl: "/images/Student Leadership.png",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('/images/Student Leadership.png') center/cover no-repeat",
        link: "https://www.instagram.com/p/DaA850VxKg6/",
        actionLabel: "Watch on Instagram"
    }
];

let activeCategory = 'all';
let activeEconomy = 'all';
let searchQuery = '';

/* ---------------------------------------------------------------
   Icons.
   The dataset used to carry emoji (📸 📰 ▶️) as its platform marks.
   Emoji render differently on every platform, cannot be recoloured
   with the theme, and are announced as their unicode name by screen
   readers — the ui-ux-pro-max Style Selection rules list "emoji as
   icons" as an anti-pattern outright. These are inline SVG instead:
   they inherit currentColor, so they theme for free, and they are
   aria-hidden because the platform name sits in text beside them.
   --------------------------------------------------------------- */
const RESOURCE_ICONS = {
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle>',
    video: '<rect x="2" y="4" width="20" height="16" rx="4"></rect><polygon points="10 9 15.5 12 10 15 10 9" fill="currentColor" stroke="none"></polygon>',
    news: '<path d="M4 4h13a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4z"></path><path d="M18 8h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2"></path><line x1="7" y1="8" x2="14" y2="8"></line><line x1="7" y1="12" x2="14" y2="12"></line><line x1="7" y1="16" x2="11" y2="16"></line>',
    report: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="17" x2="8" y2="13"></line><line x1="12" y1="17" x2="12" y2="11"></line><line x1="16" y1="17" x2="16" y2="14"></line>',
    workshop: '<path d="M12 3L2 8l10 5 10-5-10-5z"></path><path d="M2 16l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path>',
    search: '<circle cx="11" cy="11" r="7"></circle><line x1="20" y1="20" x2="16.65" y2="16.65"></line>',
    empty: '<path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>'
};

function icon(name, size) {
    const body = RESOURCE_ICONS[name] || RESOURCE_ICONS.report;
    const s = size || 14;
    return `<svg class="resource-icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true" focusable="false">${body}</svg>`;
}

/* Pick an icon from the platform first, then fall back to the category. */
function iconKeyFor(item) {
    const platform = (item.platform || '').toLowerCase();
    if (platform.includes('instagram')) return 'instagram';
    if (platform.includes('youtube')) return 'video';

    const cats = Array.isArray(item.category) ? item.category : [item.category];
    if (cats.includes('video')) return 'video';
    if (cats.includes('article')) return 'news';
    if (cats.includes('workshop')) return 'workshop';
    if (cats.includes('social')) return 'instagram';
    return 'report';
}

function initResourcesHub() {
    const categoryButtons = document.querySelectorAll('.resource-cat-btn');
    const economyButtons = document.querySelectorAll('.resource-econ-btn');
    const searchInput = document.getElementById('resource-search-input');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            activeCategory = btn.getAttribute('data-category');
            showResourceSkeletonThenRender();
        });
    });

    economyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            economyButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            activeEconomy = btn.getAttribute('data-economy');
            showResourceSkeletonThenRender();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderResources();
        });
    }

    renderResources();
}

function showResourceSkeletonThenRender() {
    const grid = document.getElementById('resources-card-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="skeleton-card"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>
            <div class="skeleton-card"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>
            <div class="skeleton-card"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>
        `;
    }
    setTimeout(renderResources, 150);
}

/* ---------------------------------------------------------------
   Entrance stagger — ui-ux-pro-max "Stagger List / Standard":
   opacity 0 -> 1, scale 0.94 -> 1, y 16 -> 0, 420ms, back.out(1.4),
   0.06s per item with grid:'auto' so the wave runs diagonally across
   the CSS grid. Progressive enhancement: if GSAP never loads, or the
   visitor asks for reduced motion, the cards are simply already
   there — nothing here sets a starting opacity in CSS.
   --------------------------------------------------------------- */
function animateResourceCards() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('#resources-card-grid .resource-card');
    if (!cards.length) return;

    gsap.killTweensOf(cards);
    gsap.fromTo(cards,
        { opacity: 0, scale: 0.94, y: 16 },
        {
            opacity: 1, scale: 1, y: 0,
            duration: 0.42,
            ease: 'back.out(1.4)',
            stagger: { each: 0.06, from: 'start', grid: 'auto' },
            // Hand the card back to CSS, or GSAP's inline transform
            // outranks the hover lift and the card can never move.
            clearProps: 'transform,opacity'
        }
    );
}

function renderResources() {
    const grid = document.getElementById('resources-card-grid');
    const countEl = document.getElementById('resource-count-badge');
    if (!grid) return;

    const filtered = resourcesData.filter(item => {
        const matchesCategory = activeCategory === 'all' ||
            item.category === activeCategory ||
            (Array.isArray(item.category) && item.category.includes(activeCategory));
        const matchesEconomy = activeEconomy === 'all' || item.economy === activeEconomy;
        const matchesSearch = searchQuery === '' ||
            item.title.toLowerCase().includes(searchQuery) ||
            item.summary.toLowerCase().includes(searchQuery) ||
            item.platform.toLowerCase().includes(searchQuery);

        return matchesCategory && matchesEconomy && matchesSearch;
    });

    if (countEl) {
        countEl.textContent = `${filtered.length} Resource${filtered.length === 1 ? '' : 's'} Found`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="resources-empty-state glass">
                <span class="empty-icon">${icon('empty', 28)}</span>
                <h3>Nothing matches those filters</h3>
                <p>Try a different category, or clear the filters to see everything in the library.</p>
                <button class="btn btn-secondary mt-15" onclick="resetResourceFilters()">Reset filters</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(item => {
        const econClass = item.economy === 'blue' ? 'badge-blue' : item.economy === 'green' ? 'badge-green' : 'badge-orange-tag';
        const econLabel = item.economy === 'blue' ? 'Blue Economy' : item.economy === 'green' ? 'Green Economy' : 'Orange Economy';

        const isExternal = item.link && item.link.startsWith('http');
        const linkAttrs = isExternal
            ? 'target="_blank" rel="noopener"'
            : `onclick="switchView('${item.link.replace('#', '')}')"`;

        const defaultLabel = item.category === 'video' ? 'Watch Video'
            : item.category === 'workshop' ? 'Explore Workshop'
                : item.category === 'social' ? 'View Post'
                    : 'Read Article';

        const actionLabel = item.actionLabel || defaultLabel;
        const key = iconKeyFor(item);
        const isPlayable = key === 'video' || key === 'instagram';

        const thumbStyle = item.imageUrl
            ? `background: linear-gradient(180deg, rgba(6, 20, 18, 0.35) 0%, rgba(6, 20, 18, 0.75) 100%), url('${item.imageUrl}') center/cover no-repeat;`
            : `background: ${item.imageBg || 'linear-gradient(135deg, #059669 0%, #0d9488 100%)'};`;

        // One link per card, stretched over the whole card by CSS. Keeps the
        // card a single tab stop and a single 44px+ target, instead of a
        // clickable region that keyboard users cannot reach.
        return `
            <article class="resource-card glass">
                <div class="resource-thumb" style="${thumbStyle}">
                    <span class="platform-badge">${icon(key)}<span>${item.platform}</span></span>
                    <span class="economy-badge ${econClass}">${econLabel}</span>
                    ${isPlayable ? `<span class="resource-play-overlay" aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="7 4 20 12 7 20 7 4"></polygon>
                        </svg>
                    </span>` : ''}
                </div>
                <div class="resource-body">
                    <div class="resource-meta">
                        <span class="meta-date">${item.date}</span>
                        <span class="meta-dot" aria-hidden="true">•</span>
                        <span class="meta-time">${item.readTime}</span>
                    </div>
                    <h3 class="resource-title">
                        <a href="${item.link}" ${linkAttrs} class="resource-link">${item.title}</a>
                    </h3>
                    <p class="resource-summary">${item.summary}</p>
                    <span class="resource-action-btn" aria-hidden="true">
                        ${actionLabel}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </span>
                </div>
            </article>
        `;
    }).join('');

    animateResourceCards();
}

function resetResourceFilters() {
    activeCategory = 'all';
    activeEconomy = 'all';
    searchQuery = '';

    const searchInput = document.getElementById('resource-search-input');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.resource-cat-btn').forEach(b => {
        const on = b.getAttribute('data-category') === 'all';
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
    });

    document.querySelectorAll('.resource-econ-btn').forEach(b => {
        const on = b.getAttribute('data-economy') === 'all';
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
    });

    renderResources();
}

// Green Rising Barbados — Resources Hub Module

// Curated live resources dataset
const resourcesData = [
    {
        id: 1,
        title: "Eco-Leaders: Ideas to Impact Workshop",
        category: ["social", "workshop"],
        economy: "green",
        platform: "Instagram",
        platformIcon: "📸",
        readTime: "Instagram Reel • Watch",
        date: "June 2026",
        summary: "Ideas. Innovation. Action. Young people from across Barbados came together under UNICEF Eastern Caribbean to share their vision for a sustainable future through the Eco-Leaders: Ideas to Impact Workshop.",
        imageUrl: "images/eco-leaders.jpg",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('images/eco-leaders.jpg') center/cover no-repeat",
        previewVisual: "▶",
        link: "https://www.instagram.com/p/DZbEuNSD4ht/",
        actionLabel: "Watch on Instagram"
    },
    {
        id: 2,
        title: "Green Rising Initiative to Empower 12,000 Youth in Climate Action",
        category: "article",
        economy: "green",
        platform: "Barbados Today",
        platformIcon: "📰",
        readTime: "3 min read",
        date: "June 2025",
        summary: "Thousands of Barbadian youth stand to gain new funding and skills through the $3M Green Rising initiative launched by Prime Minister Mia Mottley, UNICEF, and Generation Unlimited.",
        imageUrl: "images/barbados-today-launch.jpg",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('images/barbados-today-launch.jpg') center/cover no-repeat",
        previewVisual: "📄",
        link: "https://barbadostoday.bb/2025/06/21/green-rising-initiative-to-empower-12-000-youth-in-climate-action/",
        actionLabel: "Read on Barbados Today"
    },
    {
        id: 3,
        title: "Green Rising: Future Barbados & UNICEF on Youth Climate Action",
        category: "video",
        economy: "cross",
        platform: "YouTube",
        platformIcon: "▶️",
        readTime: "Feature Interview",
        date: "June 2025",
        summary: "Mornin' Barbados interview featuring Tamaisha Eytle-Harvey (Future Barbados) and Nadi Albino (UNICEF) detailing climate entrepreneurship, youth advocacy, and community action programs.",
        imageUrl: "images/youtube-interview-thumb.jpg",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('images/youtube-interview-thumb.jpg') center/cover no-repeat",
        previewVisual: "▶",
        link: "https://www.youtube.com/watch?v=KTyOGM3BBoU",
        actionLabel: "Watch on YouTube"
    },
    {
        id: 4,
        title: "Green Rising Barbados: Official Instagram Channel",
        category: "social",
        economy: "cross",
        platform: "Instagram Profile",
        platformIcon: "📸",
        readTime: "Official Feed • 21 Posts",
        date: "Live Feed",
        summary: "Follow the official Green Rising Barbados Instagram channel (@greenrisingbarbados) for live cohort updates, youth climate action stories, event announcements, and island-wide field highlights.",
        imageUrl: "images/logo.png",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('images/logo.png') center/contain no-repeat",
        previewVisual: "📸",
        link: "https://www.instagram.com/greenrisingbarbados/",
        actionLabel: "Follow on Instagram"
    },
    {
        id: 5,
        title: "Barbados Launches National Green Rising Programme to Lead Youth-Driven Climate Action",
        category: "article",
        economy: "green",
        platform: "UNICEF",
        platformIcon: "📰",
        readTime: "4 min read",
        date: "June 2025",
        summary: "Official UNICEF press release announcing the national launch of Green Rising in Barbados under Prime Minister Mia Mottley's global leadership, empowering 5,000 Barbadian youth with green & blue business grants and environmental training.",
        imageUrl: "images/Unicef green rising launch.png",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('images/Unicef green rising launch.png') center/cover no-repeat",
        previewVisual: "📄",
        link: "https://www.unicef.org/easterncaribbean/press-releases/barbados-launches-national-green-rising-programme-lead-youth-driven-climate-action",
        actionLabel: "Read on UNICEF"
    },
    {
        id: 6,
        title: "Green Rising: Reflecting on Results, Reimagining the Future",
        category: "article",
        economy: "green",
        platform: "Generation Unlimited",
        platformIcon: "📑",
        readTime: "6 min read",
        date: "March 2026",
        summary: "Generation Unlimited flagship report tracking the global Green Rising movement from COP28 to COP30, activating over 45 million young people across 40+ countries into sustainable livelihoods, green jobs, and climate action.",
        imageUrl: "images/Green Rising History .png",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('images/Green Rising History .png') center/cover no-repeat",
        previewVisual: "📊",
        link: "https://www.generationunlimited.org/green-rising-reflecting-results-reimagining-future",
        actionLabel: "Read GenU Report"
    },
    {
        id: 7,
        title: "The Presidents' Caucus: Student Agency & Leadership in Barbados",
        category: ["social", "workshop"],
        economy: "orange",
        platform: "Instagram",
        platformIcon: "📸",
        readTime: "Instagram Reel • Watch",
        date: "June 2026",
        summary: "Student leaders from across Barbados gathered for The Presidents' Caucus (@bnsc_official) to explore student voice, leadership in motion, and hands-on school community action.",
        imageUrl: "images/Student Leadership.png",
        imageBg: "linear-gradient(180deg, rgba(6, 20, 18, 0.25) 0%, rgba(6, 20, 18, 0.65) 100%), url('images/Student Leadership.png') center/cover no-repeat",
        previewVisual: "▶",
        link: "https://www.instagram.com/p/DaA850VxKg6/",
        actionLabel: "Watch on Instagram"
    }
];

let activeCategory = 'all';
let activeEconomy = 'all';
let searchQuery = '';

function initResourcesHub() {
    const categoryButtons = document.querySelectorAll('.resource-cat-btn');
    const economyButtons = document.querySelectorAll('.resource-econ-btn');
    const searchInput = document.getElementById('resource-search-input');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.getAttribute('data-category');
            showResourceSkeletonThenRender();
        });
    });

    economyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            economyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
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
                <div class="empty-icon">📁</div>
                <h3>No Resources Found in this Category</h3>
                <p>Select a different category filter or check back soon as new articles, videos, and workshops are published.</p>
                <button class="btn btn-secondary mt-15" onclick="resetResourceFilters()">Reset Category Filters</button>
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
        const previewPlayBtn = item.previewVisual ? `<div class="resource-play-overlay"><span>${item.previewVisual}</span></div>` : '';

        // Dynamic thumbnail style: supports picture file path/URL or gradient fallback
        const thumbStyle = item.imageUrl
            ? `background: linear-gradient(180deg, rgba(6, 20, 18, 0.35) 0%, rgba(6, 20, 18, 0.75) 100%), url('${item.imageUrl}') center/cover no-repeat;`
            : `background: ${item.imageBg || 'linear-gradient(135deg, #059669 0%, #0d9488 100%)'};`;

        return `
            <article class="resource-card glass">
                <div class="resource-thumb" style="${thumbStyle}">
                    <span class="platform-badge">${item.platformIcon} ${item.platform}</span>
                    <span class="economy-badge ${econClass}">${econLabel}</span>
                    ${previewPlayBtn}
                </div>
                <div class="resource-body">
                    <div class="resource-meta">
                        <span class="meta-date">${item.date}</span>
                        <span class="meta-dot">•</span>
                        <span class="meta-time">${item.readTime}</span>
                    </div>
                    <h3 class="resource-title">${item.title}</h3>
                    <p class="resource-summary">${item.summary}</p>
                    <a href="${item.link}" ${linkAttrs} class="btn btn-secondary btn-sm resource-action-btn">
                        ${actionLabel} &rarr;
                    </a>
                </div>
            </article>
        `;
    }).join('');
}

function resetResourceFilters() {
    activeCategory = 'all';
    activeEconomy = 'all';
    searchQuery = '';

    const searchInput = document.getElementById('resource-search-input');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.resource-cat-btn').forEach(b => {
        if (b.getAttribute('data-category') === 'all') b.classList.add('active');
        else b.classList.remove('active');
    });

    document.querySelectorAll('.resource-econ-btn').forEach(b => {
        if (b.getAttribute('data-economy') === 'all') b.classList.add('active');
        else b.classList.remove('active');
    });

    renderResources();
}

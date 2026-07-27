// Green Rising Barbados — Resources Hub Module

const resourcesData = [
    {
        id: 1,
        title: "Tackling Coastal Water Scarcity in Small Island Developing States",
        category: "article",
        economy: "blue",
        platform: "Article",
        platformIcon: "📄",
        readTime: "5 min read",
        date: "July 2026",
        summary: "An in-depth guide on youth-led rainwater harvesting and community hydro-monitoring systems in Barbados.",
        imageBg: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
        link: "#programmes"
    },
    {
        id: 2,
        title: "Building Disaster-Resilient Marine Craft: YOTS Cohort 3 Sea Trials",
        category: "video",
        economy: "blue",
        platform: "YouTube",
        platformIcon: "▶️",
        readTime: "8 min watch",
        date: "June 2026",
        summary: "Watch 10 Barbadian youth test their 18-foot handcrafted vessel off the coast of Oistins.",
        imageBg: "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
        link: "#programmes"
    },
    {
        id: 3,
        title: "The Orange Economy: Connecting Creative Industries to Climate Action",
        category: "workshop",
        economy: "orange",
        platform: "Workshop",
        platformIcon: "🎨",
        readTime: "12 min guide",
        date: "May 2026",
        summary: "Pinelands Creative Workshop recap covering digital media branding and sustainable craft enterprise.",
        imageBg: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        link: "#programmes"
    },
    {
        id: 4,
        title: "Hydroponics & Sargassum Compost: Food Sovereignty in Barbados",
        category: "article",
        economy: "green",
        platform: "Article",
        platformIcon: "📄",
        readTime: "6 min read",
        date: "July 2026",
        summary: "How CYEN fellows transform invasive seaweed into organic fertilizer for parish micro-farms.",
        imageBg: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
        link: "#programmes"
    },
    {
        id: 5,
        title: "Youth Climate Engine Spotlight: Kaelan Lorde on Reef Mapping",
        category: "social",
        economy: "blue",
        platform: "LinkedIn",
        platformIcon: "💼",
        readTime: "3 min read",
        date: "July 2026",
        summary: "CYEN graduate Kaelan shares key outcomes from coastal ecosystem mapping in St. Michael.",
        imageBg: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
        link: "#team"
    },
    {
        id: 6,
        title: "6-Zone Career Exploration: Navigating Tech & Blue-Green Careers",
        category: "workshop",
        economy: "orange",
        platform: "Workshop",
        platformIcon: "🚀",
        readTime: "15 min video",
        date: "June 2026",
        summary: "Interactive virtual tour through Pinelands pavilion zones for SJPI and high school students.",
        imageBg: "linear-gradient(135deg, #f97316 0%, #d97706 100%)",
        link: "#quiz"
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
            renderResources();
        });
    });

    economyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            economyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeEconomy = btn.getAttribute('data-economy');
            renderResources();
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

function renderResources() {
    const grid = document.getElementById('resources-card-grid');
    const countEl = document.getElementById('resource-count-badge');
    if (!grid) return;

    const filtered = resourcesData.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
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
                <div class="empty-icon">🔍</div>
                <h3>No Matching Resources Found</h3>
                <p>Try searching for a different keyword or resetting your category/economy filters.</p>
                <button class="btn btn-secondary mt-15" onclick="resetResourceFilters()">Reset All Filters</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(item => {
        const econClass = item.economy === 'blue' ? 'badge-blue' : item.economy === 'green' ? 'badge-green' : 'badge-orange-tag';
        const econLabel = item.economy === 'blue' ? 'Blue Economy' : item.economy === 'green' ? 'Green Economy' : 'Orange Economy';
        const actionLabel = item.category === 'video' ? 'Watch Video' : item.category === 'workshop' ? 'Explore Workshop' : item.category === 'social' ? 'View Post' : 'Read Article';

        return `
            <article class="resource-card glass">
                <div class="resource-thumb" style="background: ${item.imageBg}">
                    <span class="platform-badge">${item.platformIcon} ${item.platform}</span>
                    <span class="economy-badge ${econClass}">${econLabel}</span>
                </div>
                <div class="resource-body">
                    <div class="resource-meta">
                        <span class="meta-date">${item.date}</span>
                        <span class="meta-dot">•</span>
                        <span class="meta-time">${item.readTime}</span>
                    </div>
                    <h3 class="resource-title">${item.title}</h3>
                    <p class="resource-summary">${item.summary}</p>
                    <a href="${item.link}" class="btn btn-secondary btn-sm resource-action-btn" onclick="switchView('${item.link.replace('#','')}')">
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

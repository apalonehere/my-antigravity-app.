// Green Rising Barbados — Resources Hub Module

// Curated live resources dataset
const resourcesData = [
    {
        id: 1,
        title: "Eco Leaders Workshop",
        category: "workshop",
        economy: "green",
        platform: "Instagram",
        platformIcon: "📸",
        readTime: "Instagram Reel • Watch",
        date: "July 2026",
        summary: "Featured Instagram reel recap of the Eco Leaders Workshop — empowering young Barbadian leaders in sustainability, environmental stewardship, and community climate action.",
        imageUrl: "Thumbnail.png", // Dedicated thumbnail picture file from project folder
        previewVisual: "▶",
        link: "https://www.instagram.com/p/DZbEuNSD4ht/",
        actionLabel: "Watch on Instagram"
    }
];

let activeCategory = 'all';
let activeEconomy = 'all';
let searchQuery = '';

function handleResourceImgError(imgElement) {
    if (!imgElement) return;
    const step = parseInt(imgElement.getAttribute('data-step') || '0', 10);
    const fallbacks = ['Thumbnail.png', 'ThumbnaIl.png', './Thumbnail.png', '/Thumbnail.png'];
    
    if (step < fallbacks.length - 1) {
        imgElement.setAttribute('data-step', (step + 1).toString());
        imgElement.src = fallbacks[step + 1];
    } else {
        imgElement.style.opacity = '0';
    }
}

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
            : `onclick="switchView('${item.link.replace('#','')}')"`;

        const defaultLabel = item.category === 'video' ? 'Watch Video' 
            : item.category === 'workshop' ? 'Explore Workshop' 
            : item.category === 'social' ? 'View Post' 
            : 'Read Article';
            
        const actionLabel = item.actionLabel || defaultLabel;
        const previewPlayBtn = item.previewVisual ? `<div class="resource-play-overlay"><span>${item.previewVisual}</span></div>` : '';
        const thumbImgPath = item.imageUrl || 'Thumbnail.png';

        return `
            <article class="resource-card glass">
                <a href="${item.link}" ${linkAttrs} class="resource-thumb-link" title="${item.title}">
                    <div class="resource-thumb" style="background: linear-gradient(180deg, rgba(6, 20, 18, 0.2) 0%, rgba(6, 20, 18, 0.75) 100%), url('${thumbImgPath}') center/cover no-repeat;">
                        <img src="${thumbImgPath}" alt="${item.title}" class="resource-thumb-img" onerror="handleResourceImgError(this)">
                        <div class="resource-thumb-overlay"></div>
                        <span class="platform-badge">${item.platformIcon} ${item.platform}</span>
                        <span class="economy-badge ${econClass}">${econLabel}</span>
                        ${previewPlayBtn}
                    </div>
                </a>
                <div class="resource-body">
                    <div class="resource-meta">
                        <span class="meta-date">${item.date}</span>
                        <span class="meta-dot">•</span>
                        <span class="meta-time">${item.readTime}</span>
                    </div>
                    <h3 class="resource-title">
                        <a href="${item.link}" ${linkAttrs} style="color: inherit; text-decoration: none;">${item.title}</a>
                    </h3>
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

window.handleResourceImgError = handleResourceImgError;
window.initResourcesHub        = initResourcesHub;
window.renderResources         = renderResources;
window.resetResourceFilters    = resetResourceFilters;

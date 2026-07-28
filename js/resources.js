// --- Knowledge & Media Resources Hub Module ---
const RESOURCES_DATA = [
    {
        id: 'res-1',
        title: 'Water Scarcity & Rainwater Harvesting in Barbados',
        category: 'article',
        economy: 'blue',
        summary: 'A deep-dive technical brief on how Barbadian youth are implementing rainwater capture systems to counter drought.',
        url: 'https://futurebarbados.bb/resources/water-harvesting-guide.pdf',
        icon: '💧',
        tags: ['Water', 'ClimateAdaptation', 'BlueEconomy'],
        date: '2026-06-15',
        platform: 'Future Barbados Portal',
        thumbnail: 'Thumbnail.png'
    },
    {
        id: 'res-2',
        title: 'CYEN Youth Eco-Skills & Career Transition Playbook',
        category: 'workshop',
        economy: 'green',
        summary: 'A practical curriculum guide for young people transitioning into hydroponics, soil remediation, and eco-advocacy.',
        url: 'https://cyen.org/barbados-youth-playbook',
        icon: '🌿',
        tags: ['CYEN', 'YouthSkills', 'GreenEconomy'],
        date: '2026-05-20',
        platform: 'CYEN Caribbean Network',
        thumbnail: 'Thumbnail.png'
    },
    {
        id: 'res-3',
        title: 'Youth of the Seas (YOTS) Boat Building Demo & Sea Trial',
        category: 'video',
        economy: 'blue',
        summary: 'Watch Cohort 3 sea trial their 18-foot disaster-resilient marine craft off Oistins.',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        icon: '🎬',
        tags: ['YOTS', 'BoatBuilding', 'BlueEconomy', 'Video'],
        date: '2026-07-02',
        platform: 'YouTube',
        thumbnail: 'Thumbnail.png'
    },
    {
        id: 'res-4',
        title: 'Pinelands Creative Workshop & 6-Zone Career Pavilion Overview',
        category: 'social',
        economy: 'orange',
        summary: 'Highlights and youth testimonials from the Pinelands Orange Economy career exploration pavilion in St. Michael.',
        url: 'https://instagram.com/greenrisingbarbados',
        icon: '📱',
        tags: ['Pinelands', 'OrangeEconomy', 'YouthCareers', 'Instagram'],
        date: '2026-06-28',
        platform: 'Instagram Reel',
        thumbnail: 'Thumbnail.png'
    },
    {
        id: 'res-5',
        title: 'Eco-Leaders Workshop Reel',
        category: 'social',
        economy: 'green',
        summary: 'Watch our youth leaders in action during the Eco-Leaders field workshop on climate mitigation and sustainable agriculture.',
        url: 'https://www.instagram.com/p/DZbEuNSD4ht/',
        icon: '📱',
        tags: ['EcoLeaders', 'Workshop', 'Instagram', 'Video'],
        date: '2026-07-10',
        platform: 'Instagram Reel',
        thumbnail: 'Thumbnail.png'
    }
];

let activeResourceCategory = 'all';
let activeResourceEconomy = 'all';
let currentSearchQuery = '';

function initResourcesHub() {
    const searchInput = document.getElementById('resource-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.toLowerCase().trim();
            renderResourcesGrid();
        });
    }

    const catButtons = document.querySelectorAll('.resource-cat-btn');
    catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            catButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeResourceCategory = btn.getAttribute('data-category') || 'all';
            renderResourcesGrid();
        });
    });

    const econButtons = document.querySelectorAll('.resource-econ-btn');
    econButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            econButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeResourceEconomy = btn.getAttribute('data-economy') || 'all';
            renderResourcesGrid();
        });
    });

    renderResourcesGrid();
}

function handleResourceImgError(imgElement, defaultSrc) {
    if (!imgElement) return;
    const attempt = parseInt(imgElement.getAttribute('data-attempt') || '0', 10);
    
    if (attempt === 0) {
        imgElement.setAttribute('data-attempt', '1');
        imgElement.src = 'Thumbnail.png';
    } else if (attempt === 1) {
        imgElement.setAttribute('data-attempt', '2');
        imgElement.src = './Thumbnail.png';
    } else if (attempt === 2) {
        imgElement.setAttribute('data-attempt', '3');
        imgElement.src = defaultSrc || '/Thumbnail.png';
    } else {
        imgElement.style.display = 'none';
        const fallbackIcon = imgElement.parentElement ? imgElement.parentElement.querySelector('.resource-card-icon-fallback') : null;
        if (fallbackIcon) {
            fallbackIcon.style.display = 'flex';
        }
    }
}

function renderResourcesGrid() {
    const gridContainer = document.getElementById('resources-card-grid');
    const countBadge = document.getElementById('resource-count-badge');
    if (!gridContainer) return;

    const filtered = RESOURCES_DATA.filter(res => {
        const matchesCat = (activeResourceCategory === 'all') || (res.category === activeResourceCategory);
        const matchesEcon = (activeResourceEconomy === 'all') || (res.economy === activeResourceEconomy);
        
        let matchesSearch = true;
        if (currentSearchQuery) {
            const titleMatch = res.title.toLowerCase().includes(currentSearchQuery);
            const summaryMatch = res.summary.toLowerCase().includes(currentSearchQuery);
            const platformMatch = res.platform.toLowerCase().includes(currentSearchQuery);
            const tagMatch = res.tags.some(t => t.toLowerCase().includes(currentSearchQuery));
            matchesSearch = titleMatch || summaryMatch || platformMatch || tagMatch;
        }

        return matchesCat && matchesEcon && matchesSearch;
    });

    if (countBadge) {
        countBadge.innerText = `${filtered.length} Resource${filtered.length === 1 ? '' : 's'} Found`;
    }

    if (filtered.length === 0) {
        gridContainer.innerHTML = `
            <div class="glass p-30 text-center w-100" style="grid-column: 1 / -1;">
                <h3>No matching resources found</h3>
                <p class="text-muted mt-10">Try clearing your search query or selecting a different category/economy filter.</p>
                <button class="btn btn-secondary mt-15" onclick="resetResourceFilters()">Reset Filters</button>
            </div>
        `;
        return;
    }

    gridContainer.innerHTML = filtered.map(res => {
        const econClass = res.economy === 'blue' ? 'tag-blue' : (res.economy === 'green' ? 'tag-green' : 'tag-orange');
        const econLabel = res.economy === 'blue' ? 'Blue Economy' : (res.economy === 'green' ? 'Green Economy' : 'Orange Economy');
        
        const isInstagram = res.url.includes('instagram.com');
        const actionLabel = isInstagram ? 'Watch on Instagram ↗' : 'Access Resource ↗';
        const thumbPath = res.thumbnail || 'Thumbnail.png';

        return `
            <div class="resource-card glass" data-category="${res.category}" data-economy="${res.economy}">
                <div class="resource-card-media">
                    <img src="${thumbPath}" alt="${res.title}" class="resource-thumb-img" onerror="handleResourceImgError(this, '${thumbPath}')">
                    <div class="resource-card-icon-fallback" style="display: none;">${res.icon}</div>
                    <span class="resource-badge ${econClass}">${econLabel}</span>
                </div>
                <div class="resource-card-body">
                    <div class="resource-meta">
                        <span class="resource-platform">${res.platform}</span>
                        <span class="resource-date">${res.date}</span>
                    </div>
                    <h3 class="resource-card-title">${res.title}</h3>
                    <p class="resource-card-summary">${res.summary}</p>
                    <div class="resource-tags">
                        ${res.tags.map(t => `<span class="resource-tag">#${t}</span>`).join('')}
                    </div>
                    <a href="${res.url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm resource-cta-btn">
                        ${actionLabel}
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

function resetResourceFilters() {
    activeResourceCategory = 'all';
    activeResourceEconomy = 'all';
    currentSearchQuery = '';

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

    renderResourcesGrid();
}

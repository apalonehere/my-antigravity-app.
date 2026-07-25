// --- Meet the Team Filter Module ---
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

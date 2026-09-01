// Green Rising Barbados — published content loader.
//
// Impact figures and milestones used to live in two places that disagreed:
// hardcoded defaults in the JavaScript, and a localStorage copy written by the
// in-site admin form. localStorage is per-browser, so an edit made on one
// laptop changed what that one person saw and nothing else — the site every
// visitor loaded still showed the hardcoded numbers.
//
// They now live in content/*.json in the repo. The CMS at /admin commits to
// those files, Vercel redeploys, and every visitor gets the same figures.
// There is one source of truth and it is version-controlled.
//
// Loading is deliberately non-blocking: the markup ships with the last
// published numbers already in it, so the page is correct before this runs and
// simply refreshes in place once the JSON arrives. If the fetch fails, the
// page keeps the numbers it was served with.

const GR_CONTENT = {
    impact: null,
    milestones: null
};

async function loadPublishedContent() {
    const results = await Promise.allSettled([
        fetch('/content/impact.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
        fetch('/content/milestones.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : Promise.reject(r.status))
    ]);

    if (results[0].status === 'fulfilled') {
        GR_CONTENT.impact = results[0].value;
    } else {
        console.warn('[content] impact.json unavailable, keeping the published markup:', results[0].reason);
    }

    if (results[1].status === 'fulfilled') {
        GR_CONTENT.milestones = results[1].value;
    } else {
        console.warn('[content] milestones.json unavailable, keeping the published markup:', results[1].reason);
    }

    // Hand off to whoever renders each surface.
    if (GR_CONTENT.impact && typeof applyMetricsToUI === 'function') {
        applyMetricsToUI(getImpactMetrics(), false);
    }
    if (GR_CONTENT.impact && typeof window.refreshImpactChart === 'function') {
        window.refreshImpactChart();
    }
    if (GR_CONTENT.milestones && typeof renderMilestonesFromContent === 'function') {
        renderMilestonesFromContent();
    }

    return GR_CONTENT;
}

window.GR_CONTENT = GR_CONTENT;
window.loadPublishedContent = loadPublishedContent;

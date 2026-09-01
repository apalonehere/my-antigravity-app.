// Tomorrow's Reef — film opener.
//
// The pinned GSAP sequence that used to live here is gone. The section is now a
// sticky split-screen story driven by the ReefStory island (src/islands/), which
// uses CSS sticky plus Framer's scroll progress. Running one scroll system
// instead of two removed a whole class of bug — GSAP's pin was changing layout
// underneath Framer's scroll maths — and the split fixed the real problem, which
// was portrait photos losing 60% of their frame to letterbox.
//
// All that remains is opening the film, which reuses the existing reel modal
// rather than introducing a second video player.

// `100vw` includes the scrollbar gutter but the visible area does not, so a
// full-bleed element sized in vw overhangs by the scrollbar width and sits half
// of it off each edge. Publish the real width so the CSS can subtract it.
//
// Measured with an off-screen probe, NOT `innerWidth - clientWidth`. Those two
// diverge for reasons that have nothing to do with a scrollbar — browser zoom,
// and viewport emulation — and the difference then gets subtracted from the
// element's width. That produced a --sbw of 320px in testing and collapsed the
// full-bleed block to 70px.
(function trackScrollbarWidth() {
    function measure() {
        const probe = document.createElement('div');
        probe.style.cssText =
            'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;visibility:hidden;';
        document.body.appendChild(probe);
        const w = probe.offsetWidth - probe.clientWidth;
        probe.remove();
        return w;
    }

    function set() {
        // Only subtract a gutter when the page actually has a vertical scrollbar
        const scrolls = document.documentElement.scrollHeight > document.documentElement.clientHeight;
        const sbw = scrolls ? measure() : 0;
        document.documentElement.style.setProperty('--sbw', `${Math.max(0, sbw)}px`);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', set);
    } else {
        set();
    }
    window.addEventListener('resize', set, { passive: true });
})();

function openReefFilm() {
    if (typeof VIDEO_REELS_DATA === 'undefined' || typeof openVideoModal !== 'function') return;

    VIDEO_REELS_DATA.reefFilm = {
        category: '🪸 Tomorrow’s Reef',
        title: 'Designing a reef',
        desc: '',
        videoSrc: '/images/reef/reef-film.mp4',
        poster: '/images/reef/reef-film-poster.jpg'
    };

    // 'reefFilm' is not in REEL_ORDER, so the modal hides its counter and
    // prev/next arrows for it (see updateReelCounter in app.js).
    openVideoModal('reefFilm');
}

window.openReefFilm = openReefFilm;

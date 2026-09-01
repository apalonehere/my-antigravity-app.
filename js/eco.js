// Eco-Leaders Workshop — recap film.
//
// Mirrors js/reef.js: the film is registered under its own key rather than
// reusing the 'video3' reel entry, so the modal hides the reel counter and the
// prev/next arrows (see updateReelCounter in app.js). It plays the same file
// that already ships for the home-page reel — images/video3.mp4, 52s, 8.7 MB,
// already transcoded from the 57 MB HEVC source — so no second copy is added.

function openEcoFilm() {
    if (typeof VIDEO_REELS_DATA === 'undefined' || typeof openVideoModal !== 'function') return;

    VIDEO_REELS_DATA.ecoFilm = {
        category: 'Eco-Leaders Workshop',
        title: 'A day at the Hub',
        desc: '',
        videoSrc: '/images/video3.mp4',
        poster: '/images/eco/eco-film-poster.jpg'
    };

    openVideoModal('ecoFilm');
}

window.openEcoFilm = openEcoFilm;

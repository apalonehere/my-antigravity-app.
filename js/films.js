// Participant feature films - Tomorrow's Reef workshop.
//
// Three films, one participant each, shot at the workshop. They open in the
// same modal the home-page reels use rather than introducing a second video
// player, which is the pattern js/reef.js already established for the reef
// film.
//
// The keys here match the markup in index.html (data-film="feature-3"), so
// re-ordering which film leads the section is a markup change and swapping the
// file behind a card is a change to one entry below.
//
// NOTE: `name` is blank on all three. These are real, identifiable young people
// and nobody has told us what they are called - a placeholder name on a real
// face is worse than no name. The card falls back to the role line until the
// names arrive.
const FEATURE_FILMS = {
    'feature-3': {
        category: 'Tomorrow’s Reef',
        name: '',
        role: 'Workshop participant',
        title: 'The tower she built from one lump of clay',
        duration: '1:20',
        videoSrc: '/images/films/feature-3.mp4',
        poster: '/images/films/feature-3-poster.jpg'
    },
    'feature-4': {
        category: 'Tomorrow’s Reef',
        name: '',
        role: 'Workshop participant',
        title: 'A crowd of figures, standing together',
        duration: '1:55',
        videoSrc: '/images/films/feature-4.mp4',
        poster: '/images/films/feature-4-poster.jpg'
    },
    'feature-5': {
        category: 'Tomorrow’s Reef',
        name: '',
        role: 'Workshop participant',
        title: 'Figures that had to hold their own weight',
        duration: '2:10',
        videoSrc: '/images/films/feature-5.mp4',
        poster: '/images/films/feature-5-poster.jpg'
    }
};

function openFeatureFilm(key) {
    const film = FEATURE_FILMS[key];
    if (!film) return;
    if (typeof VIDEO_REELS_DATA === 'undefined' || typeof openVideoModal !== 'function') return;

    VIDEO_REELS_DATA[key] = {
        category: film.category,
        // The modal's own heading. Prefer the participant's name once there is
        // one, because that is what the film is actually of.
        title: film.name || film.title,
        desc: '',
        videoSrc: film.videoSrc,
        poster: film.poster
    };

    // Not in REEL_ORDER, so the modal hides its counter and prev/next arrows
    // for these - same treatment as the reef film.
    openVideoModal(key);
}

window.openFeatureFilm = openFeatureFilm;

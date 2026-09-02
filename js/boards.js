// --- Leaderboard board definitions ---
//
// One table, read by both halves of the feature: js/leaderboard.js in the
// browser and api/leaderboard.js on the server. It is a plain script that
// also exports for CommonJS, so the same file loads in a <script> tag and in
// the Vercel function. Two copies of this table would drift, and the day they
// drifted the server would start rejecting scores the client thought were
// legal.
//
//   direction  'desc' means a higher score is better (questions right, items
//              sorted). 'asc' means lower is better (moves taken).
//   min / max  the range a genuine score can fall in. Anything outside it is
//              refused: this is the only thing standing between the board and
//              a hand-written 999999, since the browser is what reports the
//              score and the browser cannot be trusted.
//   unit       the column heading on the board.

var LEADERBOARD_BOARDS = {
    'trivia-kids': {
        label: 'Climate Trivia',
        sub: 'Ages 10 to 13',
        unit: 'Correct',
        direction: 'desc',
        min: 0,
        max: 6
    },
    'trivia-teens': {
        label: 'Climate Trivia',
        sub: 'Ages 14 to 17',
        unit: 'Correct',
        direction: 'desc',
        min: 0,
        max: 6
    },
    'trivia-youth': {
        label: 'Climate Trivia',
        sub: 'Ages 18 to 29',
        unit: 'Correct',
        direction: 'desc',
        min: 0,
        max: 6
    },
    'sort': {
        label: 'Sort It',
        sub: '60 seconds',
        unit: 'Sorted',
        direction: 'desc',
        min: 0,
        // A fast player answers about one item a second, and each correct call
        // holds the card for half a second before the next appears. 90 in a
        // 60 second run is already beyond human; past that it is a script.
        max: 90
    },
    'memory-easy': {
        label: 'Reef Memory',
        sub: '6 pairs',
        unit: 'Moves',
        direction: 'asc',
        min: 6,
        max: 400
    },
    'memory-standard': {
        label: 'Reef Memory',
        sub: '8 pairs',
        unit: 'Moves',
        direction: 'asc',
        min: 8,
        max: 400
    }
};

// How many rows a board keeps. The tail is trimmed on every write, so storage
// stays flat no matter how many people play.
var LEADERBOARD_SIZE = 20;

// Names are shown to children on a public page. Two characters of nickname is
// enough to own a row; anything longer than this stops being a name and starts
// being a message.
var LEADERBOARD_NAME_MAX = 14;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LEADERBOARD_BOARDS, LEADERBOARD_SIZE, LEADERBOARD_NAME_MAX };
}

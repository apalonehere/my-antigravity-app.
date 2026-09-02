// --- Leaderboard (browser half) ---
//
// Two modes, one interface. `remote` talks to /api/leaderboard and everyone
// playing sees the same table. `local` keeps the table in this browser's
// localStorage. Which one is in force is decided once, by asking the endpoint
// whether it has storage behind it, and the answer is stated on the page
// rather than left for the visitor to work out: a board that silently means
// "only you" is a board that lies.
//
// The local mode is not a stub. It is what the site ships with, and it is the
// right default for a deployment with no database: the games still keep a
// table of your best runs. Adding the env vars in docs/leaderboard-setup.md
// promotes every board to island-wide without touching this file.

const LEADERBOARD_STORE_KEY = 'greenrising_leaderboard';
const LEADERBOARD_NAME_STORE_KEY = 'greenrising_player';
const LEADERBOARD_ENDPOINT = '/api/leaderboard';

// 'remote', 'local', or null while the first probe is still out.
let leaderboardMode = null;
let leaderboardProbe = null;
let activeBoardId = 'trivia-teens';

/* ============================================================
   NAMES
   ============================================================ */

// Mirrors the server's rule so the browser can refuse a name before a round
// trip. The server still sanitises: this copy is a courtesy, not a guard.
function sanitiseNickname(raw) {
    return String(raw === undefined || raw === null ? '' : raw)
        .replace(/[^\p{L}\p{N} '.-]/gu, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, LEADERBOARD_NAME_MAX);
}

function rememberedNickname() {
    try {
        return sanitiseNickname(localStorage.getItem(LEADERBOARD_NAME_STORE_KEY) || '');
    } catch (err) {
        return '';
    }
}

function rememberNickname(name) {
    try {
        localStorage.setItem(LEADERBOARD_NAME_STORE_KEY, name);
    } catch (err) {
        // Not being able to remember a nickname is not worth interrupting for.
    }
}

/* ============================================================
   LOCAL BOARDS
   ============================================================ */

function loadLocalBoards() {
    try {
        const raw = localStorage.getItem(LEADERBOARD_STORE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (err) {
        return {};
    }
}

function saveLocalBoards(boards) {
    try {
        localStorage.setItem(LEADERBOARD_STORE_KEY, JSON.stringify(boards));
    } catch (err) {
        console.warn('[leaderboard] local board could not be saved:', err);
    }
}

function sortBoardEntries(entries, direction) {
    return entries.slice().sort((a, b) => (
        direction === 'asc' ? a.score - b.score : b.score - a.score
    ));
}

function localBoardEntries(game) {
    const board = LEADERBOARD_BOARDS[game];
    if (!board) return [];
    const stored = loadLocalBoards()[game];
    return Array.isArray(stored) ? sortBoardEntries(stored, board.direction) : [];
}

function localSubmit(game, name, score) {
    const board = LEADERBOARD_BOARDS[game];
    const boards = loadLocalBoards();
    const rows = Array.isArray(boards[game]) ? boards[game].slice() : [];

    // One row per nickname, holding their best. Case-insensitive, or "kai" and
    // "Kai" end up as two people on a board of one.
    const key = name.toLowerCase();
    const existing = rows.findIndex(row => String(row.name).toLowerCase() === key);
    const better = existing === -1 || (
        board.direction === 'asc' ? score < rows[existing].score : score > rows[existing].score
    );
    if (existing === -1) {
        rows.push({ name, score });
    } else if (better) {
        rows[existing] = { name, score };
    }

    const sorted = sortBoardEntries(rows, board.direction).slice(0, LEADERBOARD_SIZE);
    boards[game] = sorted;
    saveLocalBoards(boards);

    const rank = sorted.findIndex(row => String(row.name).toLowerCase() === key);
    return { entries: sorted, rank: rank === -1 ? null : rank + 1 };
}

/* ============================================================
   REMOTE BOARDS
   ============================================================ */

// One probe per page load, shared by every caller. In local development the
// static server answers /api/* with index.html, so the JSON parse throws and
// the site falls to local mode without a special case for dev.
function probeLeaderboardMode() {
    if (leaderboardProbe) return leaderboardProbe;
    leaderboardProbe = fetch(`${LEADERBOARD_ENDPOINT}?game=sort`, { headers: { Accept: 'application/json' } })
        .then(res => res.json())
        .then(data => {
            leaderboardMode = (data && data.configured) ? 'remote' : 'local';
            return leaderboardMode;
        })
        .catch(() => {
            leaderboardMode = 'local';
            return leaderboardMode;
        });
    return leaderboardProbe;
}

async function fetchBoardEntries(game) {
    const mode = leaderboardMode || await probeLeaderboardMode();
    if (mode !== 'remote') return { mode: 'local', entries: localBoardEntries(game) };

    try {
        const res = await fetch(`${LEADERBOARD_ENDPOINT}?game=${encodeURIComponent(game)}`, {
            headers: { Accept: 'application/json' }
        });
        const data = await res.json();
        if (!data || !data.ok) throw new Error(data && data.error ? data.error : 'board unavailable');
        return { mode: 'remote', entries: Array.isArray(data.entries) ? data.entries : [] };
    } catch (err) {
        // A board that cannot be reached shows this browser's rows rather than
        // an empty table with an apology in it.
        console.warn('[leaderboard] falling back to the local board:', err);
        return { mode: 'local', entries: localBoardEntries(game), degraded: true };
    }
}

async function submitScore(game, rawName, score) {
    const board = LEADERBOARD_BOARDS[game];
    if (!board) return { error: 'Unknown board.' };

    const name = sanitiseNickname(rawName);
    if (name.length < 2) return { error: 'Pick a nickname of at least two characters.' };
    rememberNickname(name);

    const mode = leaderboardMode || await probeLeaderboardMode();

    // The local board is written either way. If the remote call fails, or the
    // visitor comes back offline, their own runs are still there.
    const local = localSubmit(game, name, score);

    if (mode !== 'remote') return Object.assign({ mode: 'local', name }, local);

    try {
        const res = await fetch(LEADERBOARD_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ game, name, score })
        });
        const data = await res.json();
        if (!data || !data.ok) {
            return { mode: 'remote', name, error: (data && data.error) || 'The leaderboard would not take that score.' };
        }
        return {
            mode: 'remote',
            name: data.name || name,
            rank: data.rank,
            entries: Array.isArray(data.entries) ? data.entries : []
        };
    } catch (err) {
        console.warn('[leaderboard] remote submit failed, kept locally:', err);
        return Object.assign({ mode: 'local', name, degraded: true }, local);
    }
}

/* ============================================================
   RENDERING
   ============================================================ */

function boardIdForResult(game, variant) {
    if (game === 'trivia') return `trivia-${variant}`;
    if (game === 'memory') return `memory-${variant}`;
    return 'sort';
}

function renderBoardChips() {
    const wrap = document.getElementById('play-lb-chips');
    if (!wrap) return;
    wrap.innerHTML = Object.keys(LEADERBOARD_BOARDS).map(id => {
        const board = LEADERBOARD_BOARDS[id];
        const active = id === activeBoardId;
        return `<button type="button" class="play-lb-chip${active ? ' selected' : ''}"
                    data-board="${id}" aria-pressed="${active}">
                <span class="play-lb-chip-name">${escapeArcadeText(board.label)}</span>
                <span class="play-lb-chip-sub">${escapeArcadeText(board.sub)}</span>
            </button>`;
    }).join('');

    wrap.querySelectorAll('.play-lb-chip').forEach(chip => {
        chip.addEventListener('click', () => setActiveBoard(chip.getAttribute('data-board')));
    });
}

function renderBoardScope(mode, degraded) {
    const el = document.getElementById('play-lb-scope');
    if (!el) return;
    if (mode === 'remote') {
        el.textContent = 'Everyone who plays, best run per nickname.';
    } else if (degraded) {
        el.textContent = 'The shared board is unreachable, so this is your own table for now.';
    } else {
        el.textContent = 'Your own table, kept in this browser.';
    }
}

async function renderLeaderboard() {
    const body = document.getElementById('play-lb-body');
    if (!body) return;
    const board = LEADERBOARD_BOARDS[activeBoardId];
    if (!board) return;

    body.innerHTML = '<p class="play-lb-empty">Loading the board...</p>';

    const { mode, entries, degraded } = await fetchBoardEntries(activeBoardId);
    renderBoardScope(mode, degraded);

    if (!entries.length) {
        body.innerHTML = `<p class="play-lb-empty">No scores on this board yet. Play a round and put your name at the top of it.</p>`;
        return;
    }

    const you = rememberedNickname().toLowerCase();
    body.innerHTML = `
        <table class="play-lb-table">
            <thead>
                <tr>
                    <th scope="col" class="play-lb-rank-col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col" class="play-lb-score-col">${escapeArcadeText(board.unit)}</th>
                </tr>
            </thead>
            <tbody>
                ${entries.map((entry, i) => `
                    <tr${you && String(entry.name).toLowerCase() === you ? ' class="is-you"' : ''}>
                        <td class="play-lb-rank-col">${i + 1}</td>
                        <td>${escapeArcadeText(entry.name)}</td>
                        <td class="play-lb-score-col">${Number(entry.score)}</td>
                    </tr>`).join('')}
            </tbody>
        </table>`;
}

function setActiveBoard(id) {
    if (!LEADERBOARD_BOARDS[id]) return;
    activeBoardId = id;
    renderBoardChips();
    renderLeaderboard();
}

/* ============================================================
   THE SUBMIT FORM ON A RESULT SCREEN
   ============================================================ */

// Called by js/play.js once a game is over, with the board the run belongs to
// and the score it earned.
function mountScoreSubmit(containerId, boardId, score) {
    const host = document.getElementById(containerId);
    const board = LEADERBOARD_BOARDS[boardId];
    if (!host || !board) return;

    const remembered = rememberedNickname();
    // Each game keeps its finished result screen in its own panel, so two
    // completed games mean two of these forms alive at once. Everything below
    // is found inside `host` rather than by a document-wide id for that
    // reason: getElementById would hand the sorting game the trivia form.
    // The input still needs an id, because a label has to point at one, so it
    // is built from the container's.
    const inputId = `${containerId}-name`;
    host.innerHTML = `
        <form class="play-lb-form" novalidate>
            <label class="play-lb-label" for="${inputId}">Put this on the leaderboard</label>
            <div class="play-lb-field">
                <input class="play-lb-input" id="${inputId}" name="nickname" type="text"
                    maxlength="${LEADERBOARD_NAME_MAX}" autocomplete="off" spellcheck="false"
                    placeholder="Nickname" value="${escapeArcadeText(remembered)}">
                <button type="submit" class="play-primary-btn play-lb-submit-btn">Add my score</button>
            </div>
            <p class="play-lb-hint">A nickname or a first name, not your full name. It is shown publicly.</p>
        </form>
        <p class="play-lb-status" aria-live="polite"></p>`;

    const form = host.querySelector('.play-lb-form');
    const input = host.querySelector('.play-lb-input');
    const status = host.querySelector('.play-lb-status');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        status.className = 'play-lb-status';
        status.textContent = 'Sending...';

        const result = await submitScore(boardId, input.value, score);

        if (result.error) {
            status.className = 'play-lb-status is-error';
            status.textContent = result.error;
            submitBtn.disabled = false;
            input.focus();
            return;
        }

        if (typeof playSound === 'function') playSound('badge');

        const where = result.mode === 'remote' && !result.degraded
            ? 'the shared board'
            : 'your board in this browser';
        status.className = 'play-lb-status is-good';
        status.textContent = result.rank
            ? `${result.name} is number ${result.rank} on ${where}.`
            : `Saved to ${where}. Not quite a top ${LEADERBOARD_SIZE} run this time.`;

        // Replace the form with its own outcome: leaving a live submit button
        // there invites the same score being posted twice.
        form.remove();

        activeBoardId = boardId;
        renderBoardChips();
        renderLeaderboard();
        const panel = document.getElementById('play-leaderboard');
        if (panel) panel.scrollIntoView({ behavior: prefersReducedMotionArcade() ? 'auto' : 'smooth', block: 'nearest' });
    });
}

function initLeaderboard() {
    if (!document.getElementById('play-lb-body')) return;
    renderBoardChips();
    renderLeaderboard();
}

window.initLeaderboard = initLeaderboard;
window.renderLeaderboard = renderLeaderboard;
window.setActiveBoard = setActiveBoard;
window.mountScoreSubmit = mountScoreSubmit;
window.boardIdForResult = boardIdForResult;
window.submitScore = submitScore;

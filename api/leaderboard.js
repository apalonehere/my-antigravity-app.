// Leaderboard - the only stateful endpoint on the site.
//
//   GET    /api/leaderboard?game=sort            -> the top rows for one board
//   POST   /api/leaderboard  {game, name, score} -> record a score, get a rank
//   DELETE /api/leaderboard?game=sort&name=Kai   -> remove one row (needs a token)
//
// Storage is a Redis sorted set per board, reached over Upstash's REST API so
// there is no client library and nothing new in package.json: it is one fetch
// with a bearer token. Vercel's Marketplace provisions exactly this under
// either naming, and both are accepted below.
//
// If neither pair of variables is set the endpoint still answers, with
// configured:false. That is what lets the browser fall back to a leaderboard
// held in localStorage instead of showing an error: the feature works the day
// it ships and becomes island-wide the day someone adds two env vars. See
// docs/leaderboard-setup.md.
//
// What this endpoint cannot do: prove a score is real. The games are scored in
// the browser, so a determined visitor can post a number they did not earn.
// The bounds in js/boards.js and the rate limit below keep that to a plausible
// number at a human pace, which is the honest ceiling for a browser game with
// no accounts. Do not hang a prize on it.

const { LEADERBOARD_BOARDS, LEADERBOARD_SIZE, LEADERBOARD_NAME_MAX } = require('../js/boards.js');

// Per IP, per window. Generous for a person, tedious for a script.
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_SECONDS = 600;

// A floor, not a moderation policy. Two lists, because one is not enough:
//
//   SUBSTRINGS  words that essentially never turn up inside an innocent name,
//               so they are caught anywhere, spacing and padding included.
//   WORDS       words that do turn up inside innocent ones. Matching "dick"
//               anywhere bans Dickson, "cock" bans Cockburn, "sex" bans Essex
//               and "anal" bans anyone called Analiese. These have to match a
//               whole word or they cost more than they are worth.
const NAME_BLOCKED_SUBSTRINGS = [
    'fuck', 'shit', 'cunt', 'bitch', 'bastard', 'penis', 'vagina',
    'nigger', 'nigga', 'faggot', 'retard', 'nazi', 'hitler',
    'wanker', 'slut', 'whore', 'porn'
];
const NAME_BLOCKED_WORDS = ['anal', 'sex', 'dick', 'cock', 'rape', 'ass', 'arse'];

function redisConfig() {
    const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').trim().replace(/\/+$/, '');
    const token = (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();
    if (!url || !token) return null;
    return { url, token };
}

async function redis(commands) {
    const cfg = redisConfig();
    if (!cfg) throw new Error('not configured');

    const response = await fetch(`${cfg.url}/pipeline`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${cfg.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(commands)
    });

    if (!response.ok) {
        throw new Error(`redis responded ${response.status}`);
    }
    const payload = await response.json();
    if (!Array.isArray(payload)) {
        throw new Error('unexpected redis response');
    }
    return payload.map(entry => (entry && entry.error) ? null : (entry ? entry.result : null));
}

function boardKey(game) {
    return `gr:lb:${game}`;
}

function cleanName(raw) {
    const collapsed = String(raw === undefined || raw === null ? '' : raw)
        // Anything that is not a letter, digit, space or one of three joiners
        // is dropped rather than escaped. Nothing that reaches this board is
        // ever meant to carry markup.
        .replace(/[^\p{L}\p{N} '.-]/gu, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, LEADERBOARD_NAME_MAX);
    return collapsed;
}

// Digits and symbols standing in for letters are the first thing anyone tries,
// so they are folded back before the comparison: "Sh1t" has to become "shit"
// or the list is decoration. Repeats collapse afterwards, on both sides of the
// comparison, so "shiiit" is caught too.
function normaliseNamePart(part) {
    return part
        .toLowerCase()
        .replace(/[1!|]/g, 'i')
        .replace(/0/g, 'o')
        .replace(/3/g, 'e')
        .replace(/[4@]/g, 'a')
        .replace(/[5$]/g, 's')
        .replace(/7/g, 't')
        .replace(/[^a-z]/g, '')
        .replace(/(.)\1+/g, '$1');
}

function nameIsAllowed(name) {
    const collapse = word => word.replace(/(.)\1+/g, '$1');
    const words = name.split(/[\s'.-]+/).map(normaliseNamePart).filter(Boolean);
    // Joined as well as split, so a word broken across a space or a full stop
    // is still read as the word it is.
    const joined = words.join('');

    if (NAME_BLOCKED_SUBSTRINGS.some(word => joined.includes(collapse(word)))) return false;
    if (words.some(part => NAME_BLOCKED_WORDS.some(word => part === collapse(word)))) return false;
    return true;
}

function parseBody(req) {
    if (req.body && typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
        try { return JSON.parse(req.body); } catch (err) { return {}; }
    }
    return new Promise(resolve => {
        let raw = '';
        req.on('data', chunk => { raw += chunk; if (raw.length > 4000) req.destroy(); });
        req.on('end', () => {
            try { resolve(JSON.parse(raw || '{}')); } catch (err) { resolve({}); }
        });
        req.on('error', () => resolve({}));
    });
}

// Upstash returns WITHSCORES as a flat [member, score, member, score] list.
function pairsToEntries(flat) {
    const entries = [];
    if (!Array.isArray(flat)) return entries;
    for (let i = 0; i < flat.length; i += 2) {
        entries.push({ name: String(flat[i]), score: Number(flat[i + 1]) });
    }
    return entries;
}

function readCommands(game) {
    const board = LEADERBOARD_BOARDS[game];
    const key = boardKey(game);
    return board.direction === 'desc'
        ? ['ZRANGE', key, '0', String(LEADERBOARD_SIZE - 1), 'REV', 'WITHSCORES']
        : ['ZRANGE', key, '0', String(LEADERBOARD_SIZE - 1), 'WITHSCORES'];
}

function clientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
    return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : 'unknown';
}

function send(res, status, payload) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    // A leaderboard that is a minute stale looks broken to the person who just
    // finished a run, so nothing here is cached anywhere.
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(payload));
}

module.exports = async (req, res) => {
    const url = new URL(req.url, 'https://placeholder.local');
    const configured = !!redisConfig();

    if (!configured) {
        // 200, not 500. This is a supported state, not a fault: the browser
        // reads configured:false and keeps its own board.
        send(res, 200, {
            ok: true,
            configured: false,
            reason: 'No Redis credentials on this deployment. See docs/leaderboard-setup.md.',
            entries: []
        });
        return;
    }

    try {
        if (req.method === 'GET') {
            const game = String(url.searchParams.get('game') || '');
            if (!LEADERBOARD_BOARDS[game]) {
                send(res, 400, { ok: false, configured, error: 'Unknown board.' });
                return;
            }
            const [flat] = await redis([readCommands(game)]);
            send(res, 200, { ok: true, configured, game, entries: pairsToEntries(flat) });
            return;
        }

        if (req.method === 'POST') {
            const body = await parseBody(req);
            const game = String(body.game || '');
            const board = LEADERBOARD_BOARDS[game];

            if (!board) {
                send(res, 400, { ok: false, configured, error: 'Unknown board.' });
                return;
            }

            const score = Number(body.score);
            if (!Number.isInteger(score) || score < board.min || score > board.max) {
                send(res, 400, { ok: false, configured, error: 'That score is out of range for this game.' });
                return;
            }

            const name = cleanName(body.name);
            if (name.length < 2) {
                send(res, 400, { ok: false, configured, error: 'Pick a nickname of at least two characters.' });
                return;
            }
            if (!nameIsAllowed(name)) {
                send(res, 400, { ok: false, configured, error: 'Pick a different nickname.' });
                return;
            }

            const rateKey = `gr:lb:rl:${clientIp(req)}`;
            const [hits] = await redis([['INCR', rateKey]]);
            if (Number(hits) === 1) {
                await redis([['EXPIRE', rateKey, String(RATE_LIMIT_WINDOW_SECONDS)]]);
            }
            if (Number(hits) > RATE_LIMIT_MAX) {
                send(res, 429, { ok: false, configured, error: 'That is a lot of scores at once. Try again in a few minutes.' });
                return;
            }

            const key = boardKey(game);
            const higherWins = board.direction === 'desc';

            // GT and LT keep the better of the two when a nickname is already
            // on the board, so a second worse run cannot knock out someone's
            // best, and the board holds one row per name rather than twenty.
            const commands = [
                ['ZADD', key, higherWins ? 'GT' : 'LT', String(score), name],
                // Trim from the wrong end of the range, whichever end that is.
                higherWins
                    ? ['ZREMRANGEBYRANK', key, '0', String(-1 - LEADERBOARD_SIZE)]
                    : ['ZREMRANGEBYRANK', key, String(LEADERBOARD_SIZE), '-1'],
                higherWins ? ['ZREVRANK', key, name] : ['ZRANK', key, name],
                ['ZSCORE', key, name],
                readCommands(game)
            ];

            const [, , rank, best, flat] = await redis(commands);

            send(res, 200, {
                ok: true,
                configured,
                game,
                name,
                // Null rank means the score did not make the board at all.
                rank: rank === null || rank === undefined ? null : Number(rank) + 1,
                best: best === null || best === undefined ? null : Number(best),
                entries: pairsToEntries(flat)
            });
            return;
        }

        if (req.method === 'DELETE') {
            // Removing a row is the moderation escape hatch. It needs a token
            // that only the site owner has, set as LEADERBOARD_ADMIN_TOKEN.
            const adminToken = (process.env.LEADERBOARD_ADMIN_TOKEN || '').trim();
            const offered = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
            if (!adminToken || offered !== adminToken) {
                send(res, 401, { ok: false, configured, error: 'Not authorised.' });
                return;
            }
            const game = String(url.searchParams.get('game') || '');
            const name = String(url.searchParams.get('name') || '');
            if (!LEADERBOARD_BOARDS[game] || !name) {
                send(res, 400, { ok: false, configured, error: 'Needs game and name.' });
                return;
            }
            const [removed] = await redis([['ZREM', boardKey(game), name]]);
            send(res, 200, { ok: true, configured, removed: Number(removed) || 0 });
            return;
        }

        res.setHeader('Allow', 'GET, POST, DELETE');
        send(res, 405, { ok: false, configured, error: 'Method not allowed.' });
    } catch (err) {
        console.error('[leaderboard]', err);
        send(res, 502, { ok: false, configured, error: 'The leaderboard is unavailable right now.' });
    }
};

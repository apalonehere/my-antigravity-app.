// --- Eco Arcade: trivia, waste sorting, memory match ---
//
// Three short games behind /play. They share one progress store (eco points
// plus badges) so a visitor who plays all three sees a single running total
// rather than three unrelated scores.
//
// Every stage is rendered from JavaScript rather than sitting in index.html.
// A game that cannot run without JS gains nothing from static markup, and
// keeping the question banks in one file means the copy is edited in one
// place. The shells in index.html carry a short fallback line for the case
// where this file fails to load.

/* ============================================================
   SHARED PROGRESS STORE
   ============================================================ */

const ARCADE_STORE_KEY = 'greenrising_arcade';

// Badge ids are stored, not their labels, so the wording can be reworded
// later without stranding progress that was saved under the old text.
const ARCADE_BADGES = {
    'trivia-sprout':   { icon: '\u{1F331}', label: 'Sprout',        hint: 'Score 4 or more on a trivia round' },
    'trivia-champion': { icon: '\u{1F3C6}', label: 'Perfect round', hint: 'Answer every trivia question correctly' },
    'sort-starter':    { icon: '♻️', label: 'Sorter',     hint: 'Sort 10 items correctly in one run' },
    'sort-pro':        { icon: '\u{1F5D1}️', label: 'Waste pro', hint: 'Sort 20 items correctly in one run' },
    'memory-finisher': { icon: '\u{1F9E0}', label: 'Match maker',   hint: 'Clear a memory board' },
    'memory-sharp':    { icon: '⚡', label: 'Sharp eye',        hint: 'Clear a board in under 20 moves' },
    'all-three':       { icon: '\u{1F31F}', label: 'Full house',    hint: 'Play all three games' }
};

const DEFAULT_ARCADE_STATE = { points: 0, badges: [], played: [], best: {} };

// localStorage throws in private windows on some browsers and is simply
// absent in others. A game that refuses to start because it could not save
// a score is worse than a game that forgets the score, so every read and
// write here degrades to the in-memory default.
let arcadeState = null;

function loadArcadeState() {
    if (arcadeState) return arcadeState;
    arcadeState = Object.assign({}, DEFAULT_ARCADE_STATE);
    try {
        const raw = localStorage.getItem(ARCADE_STORE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            arcadeState = {
                points: Number(parsed.points) || 0,
                badges: Array.isArray(parsed.badges) ? parsed.badges : [],
                played: Array.isArray(parsed.played) ? parsed.played : [],
                best: (parsed.best && typeof parsed.best === 'object') ? parsed.best : {}
            };
        }
    } catch (err) {
        console.warn('[arcade] progress could not be read, starting fresh:', err);
    }
    return arcadeState;
}

function saveArcadeState() {
    try {
        localStorage.setItem(ARCADE_STORE_KEY, JSON.stringify(arcadeState));
    } catch (err) {
        console.warn('[arcade] progress could not be saved:', err);
    }
}

function addArcadePoints(points) {
    const state = loadArcadeState();
    state.points += Math.max(0, Math.round(points));
    saveArcadeState();
    renderArcadeScoreboard();
}

function awardArcadeBadge(id) {
    const state = loadArcadeState();
    if (!ARCADE_BADGES[id] || state.badges.includes(id)) return false;
    state.badges.push(id);
    saveArcadeState();
    renderArcadeScoreboard();
    // Badges are awarded in the same breath as the end-of-round fanfare, so
    // the chime waits for it rather than playing over the top of it.
    window.setTimeout(() => arcadeSound('badge'), 900);
    return true;
}

function markArcadeGamePlayed(game) {
    const state = loadArcadeState();
    if (!state.played.includes(game)) {
        state.played.push(game);
        saveArcadeState();
    }
    if (state.played.length >= 3) awardArcadeBadge('all-three');
}

// Returns true only when the result is worth announcing. A first ever run is
// technically a record, but telling someone who scored nothing that they set a
// personal best reads as sarcasm, so a zero on a higher-is-better board is
// stored without the fanfare.
function recordArcadeBest(key, value, lowerIsBetter) {
    const state = loadArcadeState();
    const current = state.best[key];
    const isBest = current === undefined ||
        (lowerIsBetter ? value < current : value > current);
    if (isBest) {
        state.best[key] = value;
        saveArcadeState();
    }
    return isBest && (lowerIsBetter || value > 0);
}

function renderArcadeScoreboard() {
    const state = loadArcadeState();

    const pointsEl = document.getElementById('play-total-points');
    if (pointsEl) pointsEl.textContent = String(state.points);

    const countEl = document.getElementById('play-badge-count');
    if (countEl) {
        countEl.textContent = `${state.badges.length} of ${Object.keys(ARCADE_BADGES).length}`;
    }

    const strip = document.getElementById('play-badge-strip');
    if (!strip) return;
    strip.innerHTML = Object.keys(ARCADE_BADGES).map(id => {
        const badge = ARCADE_BADGES[id];
        const earned = state.badges.includes(id);
        const title = earned ? `${badge.label}: earned` : `${badge.label}: ${badge.hint}`;
        return `<span class="play-badge${earned ? ' earned' : ''}" title="${escapeArcadeText(title)}">
            <span class="play-badge-icon" aria-hidden="true">${badge.icon}</span>
            <span class="play-badge-label">${escapeArcadeText(badge.label)}</span>
        </span>`;
    }).join('');
}

function resetArcadeProgress() {
    if (!window.confirm('Clear your eco points and badges? This cannot be undone.')) return;
    arcadeState = Object.assign({}, DEFAULT_ARCADE_STATE, { badges: [], played: [], best: {} });
    saveArcadeState();
    renderArcadeScoreboard();
    renderTriviaStart();
    renderSortStart();
    renderMemoryStart();
}

/* --- small shared helpers --- */

function escapeArcadeText(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Fisher-Yates on a copy. The banks are module-level constants and shuffling
// them in place would reorder the source of truth for every later round.
function shuffleArcade(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function prefersReducedMotionArcade() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Single point of contact with js/sound.js, so the arcade keeps working if
// that file is absent or fails.
function arcadeSound(name) {
    if (typeof playSound === 'function') playSound(name);
}

// Same idea for js/leaderboard.js: the games are complete without it, they
// just have nowhere to post a score.
function mountArcadeScoreSubmit(containerId, boardId, score) {
    if (typeof mountScoreSubmit === 'function') mountScoreSubmit(containerId, boardId, score);
}

/* ============================================================
   GAME 1: CLIMATE TRIVIA, BANDED BY AGE
   ============================================================ */

// Three banks, deliberately different in reading level rather than only in
// difficulty. A round draws six at random from the chosen band, so a second
// attempt is not the same six questions in the same order.
const TRIVIA_BANDS = [
    { id: 'kids',  label: 'Ages 10 to 13', sub: 'Junior Rising' },
    { id: 'teens', label: 'Ages 14 to 17', sub: 'Teen Rising' },
    { id: 'youth', label: 'Ages 18 to 29', sub: 'GreenPath' }
];

const TRIVIA_ROUND_LENGTH = 6;

const TRIVIA_BANKS = {
    kids: [
        {
            q: 'Which of these belongs in a compost heap?',
            options: ['A banana peel', 'A plastic straw', 'A glass bottle', 'An old battery'],
            answer: 0,
            why: 'Food scraps like peels rot down into compost that feeds the soil. The other three never break down into anything useful.'
        },
        {
            q: 'Coral reefs are built by tiny animals. What are they called?',
            options: ['Polyps', 'Plankton', 'Pebbles', 'Prawns'],
            answer: 0,
            why: 'Each coral head is a colony of soft little animals called polyps. They build the hard stone skeleton that becomes the reef.'
        },
        {
            q: 'In "reduce, reuse, recycle", which one comes first?',
            options: ['Reduce', 'Reuse', 'Recycle', 'They are all the same'],
            answer: 0,
            why: 'The order is on purpose. The greenest rubbish is the rubbish you never made, so using less always beats sorting more.'
        },
        {
            q: 'Sea turtles sometimes swallow plastic bags. What do they think they are?',
            options: ['Jellyfish', 'Seaweed', 'Fish eggs', 'Coral'],
            answer: 0,
            why: 'A floating bag drifts exactly like a jellyfish, which is a favourite turtle snack. That is why a bag left on the beach is so dangerous.'
        },
        {
            q: 'Which endangered turtle nests on Barbadian beaches?',
            options: ['The hawksbill', 'The snapping turtle', 'The tortoise', 'The terrapin'],
            answer: 0,
            why: 'Barbados hosts one of the largest hawksbill nesting populations in the region. Bright lights and litter on the sand both put those nests at risk.'
        },
        {
            q: 'Which one of these is a renewable energy source?',
            options: ['Sunlight', 'Coal', 'Diesel', 'Petrol'],
            answer: 0,
            why: 'Sunlight arrives free every morning and never runs out. The other three are pulled out of the ground once and then burned.'
        },
        {
            q: 'What do growing trees take out of the air?',
            options: ['Carbon dioxide', 'Oxygen', 'Water vapour', 'Sand'],
            answer: 0,
            why: 'Trees pull in carbon dioxide, lock the carbon into wood and leaves, and give oxygen back out.'
        },
        {
            q: 'Which one uses less water?',
            options: ['A short shower', 'A full bath', 'They use the same', 'Neither uses water'],
            answer: 0,
            why: 'A full bath can take more than 80 litres. A short shower uses a fraction of that, and on a dry island every litre counts.'
        },
        {
            q: 'Roughly how long can a plastic bottle last in the sea?',
            options: ['Hundreds of years', 'About a week', 'About a month', 'One year'],
            answer: 0,
            why: 'Plastic does not rot. It breaks into smaller and smaller pieces over hundreds of years, and fish end up eating them.'
        },
        {
            q: 'You finish a drink at school. What is the best move?',
            options: ['Put the bottle in the recycling bin', 'Drop it in the yard', 'Leave it on a wall', 'Toss it in a gully'],
            answer: 0,
            why: 'Anything left in a gully ends up on a beach after the next heavy rain. Gullies run straight to the sea.'
        }
    ],
    teens: [
        {
            q: 'What actually happens when a coral bleaches?',
            options: [
                'It expels the algae living inside it',
                'It is bleached white by sunlight',
                'It gets buried in sand',
                'It is stained by pollution'
            ],
            answer: 0,
            why: 'Warm water stresses the coral, so it throws out the algae that feed it and give it colour. White coral is starving coral, not dead coral yet.'
        },
        {
            q: 'Which of these is a "blue carbon" ecosystem?',
            options: ['Seagrass beds', 'Pine forest', 'Sand dunes', 'A limestone quarry'],
            answer: 0,
            why: 'Blue carbon means coastal habitats that lock carbon into their soils: seagrass, mangroves and salt marshes. Hectare for hectare they can outperform forest.'
        },
        {
            q: 'Where does most of the fresh water in Barbados come from?',
            options: ['Underground aquifers', 'Rivers', 'Glacier melt', 'Imported tankers'],
            answer: 0,
            why: 'The island is porous limestone, so rain sinks instead of running in rivers. Almost all of the supply is pumped from groundwater, which is why leaks and contamination matter so much.'
        },
        {
            q: 'Sargassum is best described as:',
            options: [
                'A floating seaweed that washes up in thick mats',
                'A tropical storm system',
                'A type of coral',
                'A reef fish'
            ],
            answer: 0,
            why: 'Sargassum drifts across the Atlantic in huge rafts. Out at sea it shelters young fish and turtles. Piled on a beach and rotting, it becomes a problem for health and tourism.'
        },
        {
            q: 'In 2019 Barbados began phasing out which items?',
            options: [
                'Single-use petro-based plastics',
                'Glass bottles',
                'Paper bags',
                'Aluminium cans'
            ],
            answer: 0,
            why: 'The ban covered single-use plastic cups, cutlery, straws and polystyrene food containers, phased in across 2019 and 2020.'
        },
        {
            q: 'What does the ocean do with most of the extra heat trapped by greenhouse gases?',
            options: [
                'Absorbs it, and expands as it warms',
                'Reflects it back to space',
                'Freezes it into ice',
                'Nothing, the ocean is unaffected'
            ],
            answer: 0,
            why: 'The ocean has taken up the large majority of that extra heat. Water expands as it warms, and that expansion is a major part of sea level rise alongside melting ice.'
        },
        {
            q: 'A circular economy is one that:',
            options: [
                'Keeps materials in use and designs out waste',
                'Recycles everything after use',
                'Grows without any limit',
                'Bans manufacturing'
            ],
            answer: 0,
            why: 'Recycling is the last step, not the point. Circular design keeps a product repairable, refillable and reusable long before it is ever shredded.'
        },
        {
            q: 'Which of these can go into a home compost bin?',
            options: ['A cardboard egg box', 'A foil crisp packet', 'A drinks can', 'A ceramic plate'],
            answer: 0,
            why: 'Plain cardboard is carbon-rich brown material and balances out wet food scraps. Foil-lined packets are plastic bonded to metal, so they neither compost nor recycle easily.'
        },
        {
            q: 'What does the IPCC do?',
            options: [
                'Assesses the science of climate change for governments',
                'Sets regional fishing quotas',
                'Runs the global climate fund',
                'Certifies solar panels'
            ],
            answer: 0,
            why: 'The Intergovernmental Panel on Climate Change runs no experiments of its own. It reviews the published science and reports what the evidence adds up to.'
        },
        {
            q: 'Barbados is a world leader in which household renewable technology?',
            options: ['Solar water heaters', 'Wind turbines', 'Tidal generators', 'Hydro dams'],
            answer: 0,
            why: 'Solar water heaters have been on Barbadian roofs since the 1970s, and the island has one of the highest rates of use per person anywhere.'
        }
    ],
    youth: [
        {
            q: 'What has Barbados committed to reach by 2030?',
            options: [
                '100 percent renewable energy and carbon neutrality',
                'A 10 percent cut in emissions',
                'Doubled oil production',
                'No target at all'
            ],
            answer: 0,
            why: 'The national energy policy sets out a fully renewable, carbon neutral island by 2030. It is among the most ambitious targets any country has adopted.'
        },
        {
            q: 'The Bridgetown Initiative is a proposal to reform:',
            options: [
                'Global development and climate finance',
                'Caribbean fishing rights',
                'Regional airline routes',
                'School curricula'
            ],
            answer: 0,
            why: 'Launched from Barbados, it argues that the lending system leaves climate-vulnerable states borrowing at punishing rates to rebuild after disasters they did little to cause.'
        },
        {
            q: 'What does SIDS stand for?',
            options: [
                'Small Island Developing States',
                'Southern Islands Development Scheme',
                'Sustainable Island Data Systems',
                'Sea Ice Depth Survey'
            ],
            answer: 0,
            why: 'The SIDS grouping covers dozens of states that share small size, remoteness, and heavy exposure to sea level rise and storms.'
        },
        {
            q: 'The "blue economy" means:',
            options: [
                'Using ocean resources for growth while keeping the ocean healthy',
                'Any business located near a coast',
                'Offshore oil drilling',
                'The shipping industry alone'
            ],
            answer: 0,
            why: 'It spans fisheries, marine tourism, ocean renewables and coastal protection, and it is judged on whether the resource is still there in twenty years.'
        },
        {
            q: 'A "loss and damage" fund is meant to pay for:',
            options: [
                'Climate harm that has already happened',
                'Future emission cuts',
                'Renewable energy research',
                'Carbon offset credits'
            ],
            answer: 0,
            why: 'Mitigation prevents, adaptation prepares, and loss and damage covers what could be neither prevented nor prepared for. The fund was agreed at COP27 and capitalised at COP28.'
        },
        {
            q: 'Net zero means:',
            options: [
                'Cutting emissions as far as possible and removing the rest',
                'Emitting nothing whatsoever',
                'Buying offsets for everything',
                'Zero economic growth'
            ],
            answer: 0,
            why: 'The removals half only works if the cuts come first. A plan that leans on offsets while emissions stay flat is not net zero in any meaningful sense.'
        },
        {
            q: 'The global 30x30 target aims to protect:',
            options: [
                '30 percent of land and ocean by 2030',
                '30 species by 2030',
                '30 new marine parks by 2030',
                '30 percent of emissions by 2030'
            ],
            answer: 0,
            why: 'Agreed in the Kunming-Montreal biodiversity framework. For an island state that means marine spatial planning: deciding what happens where across the whole ocean space.'
        },
        {
            q: 'Which of these lets a solar household keep the lights on after dark?',
            options: ['Battery storage', 'A larger inverter', 'More roof space', 'A second meter'],
            answer: 0,
            why: 'Panels stop at sunset. Storage, or a grid that can carry your daytime surplus back to you at night, is what turns solar into round-the-clock supply.'
        },
        {
            q: 'What does an energy audit of a building do?',
            options: [
                'Finds where energy is wasted and what to fix first',
                'Bills the owner for past use',
                'Certifies the building as green',
                'Installs new equipment'
            ],
            answer: 0,
            why: 'It is a diagnosis, not a treatment. The value is the ranked list: the cheap fixes that pay back in months, ahead of the capital ones.'
        },
        {
            q: "Tomorrow's Reef trains young people in which field?",
            options: [
                'Underwater heritage and reef restoration',
                'Aviation maintenance',
                'Software testing',
                'Retail management'
            ],
            answer: 0,
            why: 'The programme pairs marine skills with heritage fabrication: building an underwater museum while restoring the reef it sits on.'
        }
    ]
};

let triviaRound = null;

function getSuggestedTriviaBand() {
    // If this browser already answered the programme match quiz, open on the
    // band picked there rather than asking for an age twice.
    const checked = document.querySelector('input[name="age-group"]:checked');
    const value = checked ? checked.value : null;
    return TRIVIA_BANKS[value] ? value : 'teens';
}

function renderTriviaStart(bandId) {
    const stage = document.getElementById('trivia-stage');
    if (!stage) return;
    const active = TRIVIA_BANKS[bandId] ? bandId : getSuggestedTriviaBand();
    const state = loadArcadeState();

    const bands = TRIVIA_BANDS.map(band => {
        const best = state.best[`trivia-${band.id}`];
        const bestLine = best === undefined
            ? 'Not played yet'
            : `Best: ${best} of ${TRIVIA_ROUND_LENGTH}`;
        return `<button type="button" class="play-band-card${band.id === active ? ' selected' : ''}"
                    data-band="${band.id}" aria-pressed="${band.id === active}">
                <span class="play-band-age">${escapeArcadeText(band.label)}</span>
                <span class="play-band-sub">${escapeArcadeText(band.sub)}</span>
                <span class="play-band-best">${escapeArcadeText(bestLine)}</span>
            </button>`;
    }).join('');

    stage.innerHTML = `
        <div class="play-stage-head">
            <h3 class="play-stage-title">Pick your age group</h3>
            <p class="play-stage-copy">Six questions, written for your age. Ten eco points for each one you get right, and an explanation either way.</p>
        </div>
        <div class="play-band-grid" role="group" aria-label="Age group">${bands}</div>
        <div class="play-stage-actions">
            <button type="button" class="play-primary-btn" id="trivia-start-btn">Start the round</button>
        </div>`;

    stage.querySelectorAll('.play-band-card').forEach(btn => {
        btn.addEventListener('click', () => renderTriviaStart(btn.getAttribute('data-band')));
    });
    const startBtn = document.getElementById('trivia-start-btn');
    if (startBtn) startBtn.addEventListener('click', () => startTriviaRound(active));
}

function startTriviaRound(bandId) {
    const bank = TRIVIA_BANKS[bandId] || TRIVIA_BANKS.teens;
    triviaRound = {
        band: TRIVIA_BANKS[bandId] ? bandId : 'teens',
        questions: shuffleArcade(bank).slice(0, TRIVIA_ROUND_LENGTH),
        index: 0,
        score: 0,
        streak: 0,
        answered: false
    };
    markArcadeGamePlayed('trivia');
    renderTriviaQuestion();
}

function renderTriviaQuestion() {
    const stage = document.getElementById('trivia-stage');
    if (!stage || !triviaRound) return;

    const item = triviaRound.questions[triviaRound.index];
    const number = triviaRound.index + 1;

    // Every bank entry stores the correct answer first so the copy is easy to
    // proofread. Rendered in that order, option A would be right every single
    // time, so the options are shuffled per question.
    const order = shuffleArcade(item.options.map((text, i) => ({ text, correct: i === item.answer })));
    triviaRound.order = order;
    triviaRound.answered = false;

    const options = order.map((opt, i) => `
        <button type="button" class="play-answer" data-index="${i}">
            <span class="play-answer-key" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
            <span class="play-answer-text">${escapeArcadeText(opt.text)}</span>
        </button>`).join('');

    stage.innerHTML = `
        <div class="play-run-head">
            <p class="play-run-counter">Question ${number} of ${TRIVIA_ROUND_LENGTH}</p>
            <p class="play-run-score">Score <strong id="trivia-score">${triviaRound.score}</strong> <span class="play-streak" id="trivia-streak"${triviaRound.streak > 1 ? '' : ' hidden'}>${triviaRound.streak} in a row</span></p>
        </div>
        <div class="play-progress" role="presentation">
            ${Array.from({ length: TRIVIA_ROUND_LENGTH }, (_, i) =>
                `<span class="play-progress-step${i < number ? ' active' : ''}"></span>`).join('')}
        </div>
        <h3 class="play-question">${escapeArcadeText(item.q)}</h3>
        <div class="play-answers" id="trivia-answers">${options}</div>
        <div class="play-feedback" id="trivia-feedback" aria-live="polite"></div>`;

    stage.querySelectorAll('.play-answer').forEach(btn => {
        btn.addEventListener('click', () => answerTrivia(Number(btn.getAttribute('data-index'))));
    });
}

function answerTrivia(choiceIndex) {
    if (!triviaRound || triviaRound.answered) return;
    triviaRound.answered = true;

    const item = triviaRound.questions[triviaRound.index];
    const order = triviaRound.order;
    const correct = !!(order[choiceIndex] && order[choiceIndex].correct);

    if (correct) {
        triviaRound.score += 1;
        triviaRound.streak += 1;
        addArcadePoints(10);
    } else {
        triviaRound.streak = 0;
    }

    // js/sound.js may not have loaded, and is silent unless the visitor turned
    // sound on. Every cue in this file is guarded the same way: a game that
    // throws because an optional module is missing is not a game.
    arcadeSound(correct ? 'correct' : 'wrong');

    document.querySelectorAll('#trivia-answers .play-answer').forEach((btn, i) => {
        btn.disabled = true;
        if (order[i] && order[i].correct) btn.classList.add('is-correct');
        else if (i === choiceIndex) btn.classList.add('is-wrong');
    });

    // The header has to move with the answer. Waiting for the next question to
    // repaint it left the score reading zero on the screen that just told the
    // player they were right.
    const scoreEl = document.getElementById('trivia-score');
    if (scoreEl) scoreEl.textContent = String(triviaRound.score);
    const streakEl = document.getElementById('trivia-streak');
    if (streakEl) {
        streakEl.hidden = triviaRound.streak < 2;
        streakEl.textContent = `${triviaRound.streak} in a row`;
    }

    const feedback = document.getElementById('trivia-feedback');
    const last = triviaRound.index === TRIVIA_ROUND_LENGTH - 1;
    if (feedback) {
        feedback.className = `play-feedback show ${correct ? 'good' : 'bad'}`;
        feedback.innerHTML = `
            <p class="play-feedback-verdict">${correct ? 'Correct' : 'Not quite'}</p>
            <p class="play-feedback-why">${escapeArcadeText(item.why)}</p>
            <button type="button" class="play-primary-btn" id="trivia-next-btn">${last ? 'See my score' : 'Next question'}</button>`;
        const nextBtn = document.getElementById('trivia-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (last) {
                    finishTriviaRound();
                } else {
                    triviaRound.index += 1;
                    renderTriviaQuestion();
                }
            });
            // Moving focus keeps the keyboard on the only live control; the
            // answer buttons behind it are all disabled at this point.
            nextBtn.focus();
        }
    }
}

function finishTriviaRound() {
    const stage = document.getElementById('trivia-stage');
    if (!stage || !triviaRound) return;

    const score = triviaRound.score;
    const band = triviaRound.band;
    const isBest = recordArcadeBest(`trivia-${band}`, score, false);

    const earned = [];
    if (score >= 4 && awardArcadeBadge('trivia-sprout')) earned.push(ARCADE_BADGES['trivia-sprout']);
    if (score === TRIVIA_ROUND_LENGTH && awardArcadeBadge('trivia-champion')) earned.push(ARCADE_BADGES['trivia-champion']);

    let verdict;
    if (score === TRIVIA_ROUND_LENGTH) verdict = 'Every one. You could run the session yourself.';
    else if (score >= 4) verdict = 'Strong round. The ones you missed are worth a second look.';
    else if (score >= 2) verdict = 'A start. Read the explanations and go again, the round reshuffles.';
    else verdict = 'Everyone begins somewhere. Run it again, it draws different questions each time.';

    stage.innerHTML = `
        <div class="play-result">
            <span class="play-result-eyebrow">Round complete</span>
            <p class="play-result-score"><strong>${score}</strong> <span>of ${TRIVIA_ROUND_LENGTH}</span></p>
            <p class="play-result-copy">${escapeArcadeText(verdict)}</p>
            ${isBest ? '<p class="play-result-flag">New personal best for this age group.</p>' : ''}
            ${earned.length ? `<p class="play-result-flag">Badge unlocked: ${earned.map(b => escapeArcadeText(b.label)).join(', ')}</p>` : ''}
            <div class="play-lb-slot" id="lb-submit-trivia"></div>
            <div class="play-stage-actions">
                <button type="button" class="play-primary-btn" id="trivia-again-btn">Play again</button>
                <button type="button" class="play-ghost-btn" id="trivia-band-btn">Change age group</button>
                <a class="play-ghost-btn" href="/apply">Join a programme</a>
            </div>
        </div>`;

    arcadeSound(score >= 4 ? 'win' : 'timeup');
    mountArcadeScoreSubmit('lb-submit-trivia', `trivia-${band}`, score);

    const againBtn = document.getElementById('trivia-again-btn');
    if (againBtn) againBtn.addEventListener('click', () => startTriviaRound(band));
    const bandBtn = document.getElementById('trivia-band-btn');
    if (bandBtn) bandBtn.addEventListener('click', () => renderTriviaStart(band));

    triviaRound = null;
}

/* ============================================================
   GAME 2: SORT IT, A TIMED WASTE-STREAM RUN
   ============================================================ */

const SORT_BINS = [
    { id: 'recycle',   label: 'Recycling', icon: '♻️', hint: 'Clean paper, card, glass, cans, rigid plastic' },
    { id: 'compost',   label: 'Compost',   icon: '\u{1F343}', hint: 'Food scraps and garden waste' },
    { id: 'landfill',  label: 'General waste', icon: '\u{1F5D1}️', hint: 'Nothing else will take it' },
    { id: 'hazardous', label: 'Hazardous',  icon: '⚠️', hint: 'Chemicals, batteries, bulbs, oils' }
];

const SORT_ROUND_SECONDS = 60;

const SORT_ITEMS = [
    { name: 'Plastic drink bottle', icon: '\u{1F9F4}', bin: 'recycle',   fact: 'Rinse it and leave the cap on. Loose caps are too small to survive the sorting line.' },
    { name: 'Banana peel',          icon: '\u{1F34C}', bin: 'compost',   fact: 'Peels are about 90 percent water and break down in weeks.' },
    { name: 'Glass bottle',         icon: '\u{1F37E}', bin: 'recycle',   fact: 'Glass can be melted and reformed endlessly with no loss of quality.' },
    { name: 'Used cooking oil',     icon: '\u{1F373}', bin: 'hazardous', fact: 'Never down the sink. Cooled oil in a sealed container goes to a collection point.' },
    { name: 'Aluminium can',        icon: '\u{1F964}', bin: 'recycle',   fact: 'Recycling a can uses about 5 percent of the energy needed to make a new one.' },
    { name: 'Foil crisp packet',    icon: '\u{1F35F}', bin: 'landfill',  fact: 'Plastic bonded to a metal layer. Almost no facility can separate the two.' },
    { name: 'Cardboard box',        icon: '\u{1F4E6}', bin: 'recycle',   fact: 'Flatten it and keep it dry. Wet or greasy cardboard contaminates the whole bale.' },
    { name: 'Mango skins',          icon: '\u{1F96D}', bin: 'compost',   fact: 'Fruit waste adds nitrogen. Balance it with dry leaves or cardboard.' },
    { name: 'Old phone battery',    icon: '\u{1F50B}', bin: 'hazardous', fact: 'Lithium cells catch fire when crushed in a truck. They need their own drop-off.' },
    { name: 'Half tin of paint',    icon: '\u{1F3A8}', bin: 'hazardous', fact: 'Wet paint leaches into groundwater, and Barbados drinks its groundwater.' },
    { name: 'Coconut husk',         icon: '\u{1F965}', bin: 'compost',   fact: 'Chopped husk holds water in the soil and is sold worldwide as coir.' },
    { name: 'Broken drinking glass', icon: '\u{1F4A5}', bin: 'landfill', fact: 'Drinking glass and window glass melt at a different temperature from bottle glass, so they ruin the batch.' },
    { name: 'Newspaper',            icon: '\u{1F4F0}', bin: 'recycle',   fact: 'Paper fibres can go round about seven times before they are too short to reuse.' },
    { name: 'Grass clippings',      icon: '\u{1F33F}', bin: 'compost',   fact: 'Left in a bag they turn to slime. Spread thin, they heat a compost heap fast.' },
    { name: 'Disposable nappy',     icon: '\u{1F9F7}', bin: 'landfill',  fact: 'Mixed plastics, gel and organics in one item. No stream will take it.' },
    { name: 'Plastic straw',        icon: '\u{1F964}', bin: 'landfill',  fact: 'Too light and thin to be sorted mechanically. Barbados phased them out in 2019.' },
    { name: 'Egg shells',           icon: '\u{1F95A}', bin: 'compost',   fact: 'Crushed shells add calcium. Whole ones just take much longer to break down.' },
    { name: 'Steel food tin',       icon: '\u{1F96B}', bin: 'recycle',   fact: 'Magnets pull steel straight out of the mixed stream, so it is one of the easiest wins.' },
    { name: 'Fluorescent tube',     icon: '\u{1F4A1}', bin: 'hazardous', fact: 'Each tube holds a trace of mercury vapour, which is why it must never be snapped in a bin.' },
    { name: 'Polystyrene food box', icon: '\u{1F371}', bin: 'landfill',  fact: 'Over 95 percent air, so it is uneconomic to transport for recycling. Also phased out locally.' },
    { name: 'Coffee grounds',       icon: '☕', bin: 'compost',   fact: 'Grounds are close to a perfect compost input and worms are drawn to them.' },
    { name: 'Tangled fishing line', icon: '\u{1F3A3}', bin: 'landfill',  fact: 'Bag it before binning. Loose line on a beach entangles turtles and seabirds for decades.' }
];

let sortRun = null;

function renderSortStart() {
    const stage = document.getElementById('sort-stage');
    if (!stage) return;
    const state = loadArcadeState();
    const best = state.best['sort'];

    stage.innerHTML = `
        <div class="play-stage-head">
            <h3 class="play-stage-title">Sort it before the timer runs out</h3>
            <p class="play-stage-copy">One item at a time, ${SORT_ROUND_SECONDS} seconds on the clock. Drag it to a bin, or just click the bin. Five eco points per correct call, and you learn why on every one.</p>
            ${best === undefined ? '' : `<p class="play-stage-best">Your best run: ${best} correct</p>`}
        </div>
        <div class="play-bin-legend">
            ${SORT_BINS.map(bin => `
                <div class="play-legend-item">
                    <span class="play-legend-icon" aria-hidden="true">${bin.icon}</span>
                    <span><strong>${escapeArcadeText(bin.label)}</strong><br>${escapeArcadeText(bin.hint)}</span>
                </div>`).join('')}
        </div>
        <div class="play-stage-actions">
            <button type="button" class="play-primary-btn" id="sort-start-btn">Start the run</button>
        </div>`;

    const startBtn = document.getElementById('sort-start-btn');
    if (startBtn) startBtn.addEventListener('click', startSortRun);
}

function startSortRun() {
    stopSortTimer();
    sortRun = {
        queue: shuffleArcade(SORT_ITEMS),
        cursor: 0,
        correct: 0,
        wrong: 0,
        streak: 0,
        bestStreak: 0,
        secondsLeft: SORT_ROUND_SECONDS,
        locked: false
    };
    markArcadeGamePlayed('sort');
    renderSortBoard();
    nextSortItem();

    sortRun.timer = window.setInterval(() => {
        if (!sortRun) return stopSortTimer();
        sortRun.secondsLeft -= 1;
        updateSortClock();
        // The last five seconds get a pip a second. Any earlier and a one
        // minute round becomes sixty beeps.
        if (sortRun.secondsLeft > 0 && sortRun.secondsLeft <= 5) arcadeSound('tick');
        if (sortRun.secondsLeft <= 0) finishSortRun();
    }, 1000);
}

function stopSortTimer() {
    if (sortRun && sortRun.timer) {
        window.clearInterval(sortRun.timer);
        sortRun.timer = null;
    }
}

function renderSortBoard() {
    const stage = document.getElementById('sort-stage');
    if (!stage) return;

    stage.innerHTML = `
        <div class="play-run-head">
            <p class="play-run-counter">Time <strong id="sort-clock">${SORT_ROUND_SECONDS}</strong>s</p>
            <p class="play-run-score">Correct <strong id="sort-score">0</strong> <span class="play-streak" id="sort-streak" hidden></span></p>
        </div>
        <div class="play-timer-track" role="presentation"><span class="play-timer-fill" id="sort-timer-fill"></span></div>

        <div class="play-item-card" id="sort-item" draggable="true" aria-live="polite">
            <span class="play-item-icon" aria-hidden="true"></span>
            <span class="play-item-name"></span>
        </div>

        <div class="play-bins" id="sort-bins">
            ${SORT_BINS.map(bin => `
                <button type="button" class="play-bin" data-bin="${bin.id}">
                    <span class="play-bin-icon" aria-hidden="true">${bin.icon}</span>
                    <span class="play-bin-label">${escapeArcadeText(bin.label)}</span>
                </button>`).join('')}
        </div>
        <p class="play-feedback" id="sort-feedback" aria-live="polite"></p>
        <div class="play-stage-actions play-stage-actions-quiet">
            <button type="button" class="play-ghost-btn" id="sort-stop-btn">End run</button>
        </div>`;

    stage.querySelectorAll('.play-bin').forEach(binEl => {
        binEl.addEventListener('click', () => answerSort(binEl.getAttribute('data-bin')));

        // Drag and drop is the fun version, but it is an addition rather than
        // the mechanism: the bins are real buttons, so click, tap, Enter and
        // Space all work without a pointer ever being dragged.
        binEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            binEl.classList.add('drag-over');
        });
        binEl.addEventListener('dragleave', () => binEl.classList.remove('drag-over'));
        binEl.addEventListener('drop', (e) => {
            e.preventDefault();
            binEl.classList.remove('drag-over');
            answerSort(binEl.getAttribute('data-bin'));
        });
    });

    const itemEl = document.getElementById('sort-item');
    if (itemEl) {
        itemEl.addEventListener('dragstart', (e) => {
            itemEl.classList.add('dragging');
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                // Firefox refuses to start a drag unless some data is set.
                e.dataTransfer.setData('text/plain', 'item');
            }
        });
        itemEl.addEventListener('dragend', () => itemEl.classList.remove('dragging'));
    }

    const stopBtn = document.getElementById('sort-stop-btn');
    if (stopBtn) stopBtn.addEventListener('click', finishSortRun);
}

function updateSortClock() {
    if (!sortRun) return;
    const clock = document.getElementById('sort-clock');
    if (clock) clock.textContent = String(Math.max(0, sortRun.secondsLeft));
    const fill = document.getElementById('sort-timer-fill');
    if (fill) {
        const pct = Math.max(0, sortRun.secondsLeft) / SORT_ROUND_SECONDS * 100;
        fill.style.width = `${pct}%`;
        fill.classList.toggle('low', sortRun.secondsLeft <= 10);
    }
}

function nextSortItem() {
    if (!sortRun) return;
    // The queue is 22 items and a fast player can clear it inside the minute,
    // so it wraps and reshuffles rather than ending the run early.
    if (sortRun.cursor >= sortRun.queue.length) {
        sortRun.queue = shuffleArcade(SORT_ITEMS);
        sortRun.cursor = 0;
    }
    const item = sortRun.queue[sortRun.cursor];
    const card = document.getElementById('sort-item');
    if (!card) return;

    card.classList.remove('is-correct', 'is-wrong');
    card.querySelector('.play-item-icon').textContent = item.icon;
    card.querySelector('.play-item-name').textContent = item.name;
    sortRun.locked = false;
}

function answerSort(binId) {
    if (!sortRun || sortRun.locked || sortRun.secondsLeft <= 0) return;
    const item = sortRun.queue[sortRun.cursor];
    if (!item) return;

    sortRun.locked = true;
    const correct = item.bin === binId;
    const card = document.getElementById('sort-item');
    const feedback = document.getElementById('sort-feedback');
    const binName = (SORT_BINS.find(b => b.id === item.bin) || {}).label || item.bin;

    if (correct) {
        sortRun.correct += 1;
        sortRun.streak += 1;
        sortRun.bestStreak = Math.max(sortRun.bestStreak, sortRun.streak);
        addArcadePoints(5);
    } else {
        sortRun.wrong += 1;
        sortRun.streak = 0;
    }

    arcadeSound(correct ? 'correct' : 'wrong');

    if (card) card.classList.add(correct ? 'is-correct' : 'is-wrong');
    if (feedback) {
        feedback.className = `play-feedback show ${correct ? 'good' : 'bad'}`;
        feedback.innerHTML = `<strong>${correct ? 'Yes.' : `${escapeArcadeText(binName)}.`}</strong> ${escapeArcadeText(item.fact)}`;
    }

    const scoreEl = document.getElementById('sort-score');
    if (scoreEl) scoreEl.textContent = String(sortRun.correct);
    const streakEl = document.getElementById('sort-streak');
    if (streakEl) {
        streakEl.hidden = sortRun.streak < 3;
        streakEl.textContent = `${sortRun.streak} in a row`;
    }

    sortRun.cursor += 1;
    window.setTimeout(() => {
        if (sortRun && sortRun.secondsLeft > 0) nextSortItem();
    }, correct ? 500 : 1100);
}

function finishSortRun() {
    if (!sortRun) return;
    stopSortTimer();

    const correct = sortRun.correct;
    const total = correct + sortRun.wrong;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    const isBest = recordArcadeBest('sort', correct, false);

    const earned = [];
    if (correct >= 10 && awardArcadeBadge('sort-starter')) earned.push(ARCADE_BADGES['sort-starter']);
    if (correct >= 20 && awardArcadeBadge('sort-pro')) earned.push(ARCADE_BADGES['sort-pro']);

    sortRun = null;

    const stage = document.getElementById('sort-stage');
    if (!stage) return;
    stage.innerHTML = `
        <div class="play-result">
            <span class="play-result-eyebrow">Run over</span>
            <p class="play-result-score"><strong>${correct}</strong> <span>sorted correctly</span></p>
            <p class="play-result-copy">${accuracy}% accuracy across ${total} item${total === 1 ? '' : 's'}. The awkward ones are the point: foil packets, polystyrene and anything with a battery in it.</p>
            ${isBest ? '<p class="play-result-flag">New personal best.</p>' : ''}
            ${earned.length ? `<p class="play-result-flag">Badge unlocked: ${earned.map(b => escapeArcadeText(b.label)).join(', ')}</p>` : ''}
            <div class="play-lb-slot" id="lb-submit-sort"></div>
            <div class="play-stage-actions">
                <button type="button" class="play-primary-btn" id="sort-again-btn">Run it again</button>
                <button type="button" class="play-ghost-btn" id="sort-rules-btn">Back to the bin guide</button>
            </div>
        </div>`;

    arcadeSound(correct >= 10 ? 'win' : 'timeup');
    if (correct > 0) mountArcadeScoreSubmit('lb-submit-sort', 'sort', correct);

    const againBtn = document.getElementById('sort-again-btn');
    if (againBtn) againBtn.addEventListener('click', startSortRun);
    const rulesBtn = document.getElementById('sort-rules-btn');
    if (rulesBtn) rulesBtn.addEventListener('click', renderSortStart);
}

/* ============================================================
   GAME 3: REEF MEMORY MATCH
   ============================================================ */

// Matching a pair does not just clear two tiles, it prints the fact for that
// species or system into the log beside the board. The reward for playing is
// the thing we actually want read.
const MEMORY_PAIRS = [
    { id: 'turtle',  icon: '\u{1F422}', label: 'Hawksbill turtle', fact: 'Hawksbills nest on Barbadian beaches through the summer. Hatchlings steer by the brightest horizon, which is why beachfront lighting matters.' },
    { id: 'coral',   icon: '\u{1FAB8}', label: 'Coral polyp',      fact: 'A reef is built by animals the size of a pinhead, laying down limestone one layer at a time.' },
    { id: 'water',   icon: '\u{1F4A7}', label: 'Rain barrel',      fact: 'A roof of 100 square metres can harvest thousands of litres a year on an island with no rivers.' },
    { id: 'solar',   icon: '☀️', label: 'Solar array',      fact: 'Barbados aims to run on 100 percent renewable energy by 2030, and rooftop solar carries much of that load.' },
    { id: 'seagrass', icon: '\u{1F33F}', label: 'Seagrass bed',    fact: 'Seagrass is a nursery for young fish and stores carbon in its sediment for centuries.' },
    { id: 'recycle', icon: '♻️', label: 'Recycling',        fact: 'Sorting at the source is what makes recycling work. One dirty item can spoil a whole bale.' },
    { id: 'fish',    icon: '\u{1F420}', label: 'Parrotfish',       fact: 'Parrotfish graze algae off coral and grind old coral into sand. Much of a Barbadian beach passed through one first.' },
    { id: 'mangrove', icon: '\u{1F343}', label: 'Mangrove',        fact: 'Mangrove roots break wave energy before it reaches the shore, which is coastal defence that plants itself.' }
];

const MEMORY_LEVELS = {
    easy:     { pairs: 6, label: 'Easy', sub: '12 tiles' },
    standard: { pairs: 8, label: 'Standard', sub: '16 tiles' }
};

let memoryGame = null;

function renderMemoryStart(levelId) {
    const stage = document.getElementById('memory-stage');
    if (!stage) return;
    const active = MEMORY_LEVELS[levelId] ? levelId : 'easy';
    const state = loadArcadeState();

    const levels = Object.keys(MEMORY_LEVELS).map(id => {
        const level = MEMORY_LEVELS[id];
        const best = state.best[`memory-${id}`];
        return `<button type="button" class="play-band-card${id === active ? ' selected' : ''}"
                    data-level="${id}" aria-pressed="${id === active}">
                <span class="play-band-age">${escapeArcadeText(level.label)}</span>
                <span class="play-band-sub">${escapeArcadeText(level.sub)}</span>
                <span class="play-band-best">${best === undefined ? 'Not played yet' : `Best: ${best} moves`}</span>
            </button>`;
    }).join('');

    stage.innerHTML = `
        <div class="play-stage-head">
            <h3 class="play-stage-title">Find the pairs</h3>
            <p class="play-stage-copy">Turn two tiles at a time. Every pair you match unlocks a fact about the reef and the island beside the board.</p>
        </div>
        <div class="play-band-grid play-band-grid-2" role="group" aria-label="Board size">${levels}</div>
        <div class="play-stage-actions">
            <button type="button" class="play-primary-btn" id="memory-start-btn">Deal the board</button>
        </div>`;

    stage.querySelectorAll('.play-band-card').forEach(btn => {
        btn.addEventListener('click', () => renderMemoryStart(btn.getAttribute('data-level')));
    });
    const startBtn = document.getElementById('memory-start-btn');
    if (startBtn) startBtn.addEventListener('click', () => startMemoryGame(active));
}

function startMemoryGame(levelId) {
    const level = MEMORY_LEVELS[levelId] || MEMORY_LEVELS.easy;
    const chosen = shuffleArcade(MEMORY_PAIRS).slice(0, level.pairs);
    const deck = shuffleArcade(
        chosen.concat(chosen).map((pair, i) => ({ pair, key: `${pair.id}-${i}` }))
    );

    memoryGame = {
        level: MEMORY_LEVELS[levelId] ? levelId : 'easy',
        deck,
        pairsTotal: level.pairs,
        matched: [],
        first: null,
        moves: 0,
        locked: false
    };
    markArcadeGamePlayed('memory');
    renderMemoryBoard();
}

function renderMemoryBoard() {
    const stage = document.getElementById('memory-stage');
    if (!stage || !memoryGame) return;

    const tiles = memoryGame.deck.map((card, i) => `
        <button type="button" class="memory-tile" data-index="${i}" aria-label="Face down tile ${i + 1}">
            <span class="memory-tile-inner">
                <span class="memory-face memory-face-back" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
                        <path fill="currentColor" d="M12 3c-1.4 3.2-4 4.6-6.6 5.4C4 8.8 3 10 3 11.6 3 15.7 7 20 12 21c5-1 9-5.3 9-9.4 0-1.6-1-2.8-2.4-3.2C16 7.6 13.4 6.2 12 3Z"/>
                    </svg>
                </span>
                <span class="memory-face memory-face-front">
                    <span class="memory-face-icon" aria-hidden="true">${card.pair.icon}</span>
                    <span class="memory-face-label">${escapeArcadeText(card.pair.label)}</span>
                </span>
            </span>
        </button>`).join('');

    stage.innerHTML = `
        <div class="play-run-head">
            <p class="play-run-counter">Moves <strong id="memory-moves">0</strong></p>
            <p class="play-run-score">Pairs <strong id="memory-pairs">0</strong> of ${memoryGame.pairsTotal}</p>
        </div>
        <div class="memory-layout">
            <div class="memory-grid" id="memory-grid">${tiles}</div>
            <aside class="memory-log" aria-live="polite">
                <h4 class="memory-log-title">What you uncovered</h4>
                <ul class="memory-log-list" id="memory-log-list">
                    <li class="memory-log-empty">Match a pair to unlock its story.</li>
                </ul>
            </aside>
        </div>
        <div class="play-stage-actions play-stage-actions-quiet">
            <button type="button" class="play-ghost-btn" id="memory-restart-btn">Shuffle and restart</button>
        </div>`;

    stage.querySelectorAll('.memory-tile').forEach(tile => {
        tile.addEventListener('click', () => flipMemoryTile(Number(tile.getAttribute('data-index'))));
    });
    const restartBtn = document.getElementById('memory-restart-btn');
    if (restartBtn) restartBtn.addEventListener('click', () => startMemoryGame(memoryGame ? memoryGame.level : 'easy'));
}

function flipMemoryTile(index) {
    if (!memoryGame || memoryGame.locked) return;
    const card = memoryGame.deck[index];
    if (!card || memoryGame.matched.includes(card.pair.id)) return;
    if (memoryGame.first && memoryGame.first.index === index) return;

    const tileEl = document.querySelector(`.memory-tile[data-index="${index}"]`);
    if (!tileEl || tileEl.classList.contains('flipped')) return;

    tileEl.classList.add('flipped');
    tileEl.setAttribute('aria-label', card.pair.label);
    arcadeSound('flip');

    if (!memoryGame.first) {
        memoryGame.first = { index, card, el: tileEl };
        return;
    }

    memoryGame.moves += 1;
    const movesEl = document.getElementById('memory-moves');
    if (movesEl) movesEl.textContent = String(memoryGame.moves);

    const first = memoryGame.first;
    memoryGame.first = null;

    if (first.card.pair.id === card.pair.id) {
        memoryGame.matched.push(card.pair.id);
        first.el.classList.add('matched');
        tileEl.classList.add('matched');
        addArcadePoints(5);
        arcadeSound('match');
        addMemoryLogEntry(card.pair);

        const pairsEl = document.getElementById('memory-pairs');
        if (pairsEl) pairsEl.textContent = String(memoryGame.matched.length);

        if (memoryGame.matched.length === memoryGame.pairsTotal) {
            window.setTimeout(finishMemoryGame, 600);
        }
        return;
    }

    // Wrong pair: hold both faces up long enough to be read, and block further
    // flips in the meantime so a fast clicker cannot leave three tiles open.
    memoryGame.locked = true;
    first.el.classList.add('miss');
    tileEl.classList.add('miss');
    arcadeSound('wrong');
    window.setTimeout(() => {
        [first.el, tileEl].forEach((el, i) => {
            el.classList.remove('flipped', 'miss');
            el.setAttribute('aria-label', `Face down tile ${(i === 0 ? first.index : index) + 1}`);
        });
        if (memoryGame) memoryGame.locked = false;
    }, prefersReducedMotionArcade() ? 700 : 950);
}

function addMemoryLogEntry(pair) {
    const list = document.getElementById('memory-log-list');
    if (!list) return;
    const empty = list.querySelector('.memory-log-empty');
    if (empty) empty.remove();
    const li = document.createElement('li');
    li.className = 'memory-log-item';
    li.innerHTML = `<span class="memory-log-icon" aria-hidden="true">${pair.icon}</span>
        <span><strong>${escapeArcadeText(pair.label)}</strong> ${escapeArcadeText(pair.fact)}</span>`;
    list.appendChild(li);
}

function finishMemoryGame() {
    if (!memoryGame) return;
    const moves = memoryGame.moves;
    const level = memoryGame.level;
    const pairs = memoryGame.pairsTotal;
    const isBest = recordArcadeBest(`memory-${level}`, moves, true);

    const earned = [];
    if (awardArcadeBadge('memory-finisher')) earned.push(ARCADE_BADGES['memory-finisher']);
    if (moves < 20 && awardArcadeBadge('memory-sharp')) earned.push(ARCADE_BADGES['memory-sharp']);

    // A perfect run is one move per pair after the first sighting, so the
    // floor is roughly pairs + a few. Bonus points scale off that, never
    // below zero however long the board took.
    const bonus = Math.max(10, 80 - (moves - pairs) * 4);
    addArcadePoints(bonus);

    memoryGame = null;

    const stage = document.getElementById('memory-stage');
    if (!stage) return;
    stage.innerHTML = `
        <div class="play-result">
            <span class="play-result-eyebrow">Board cleared</span>
            <p class="play-result-score"><strong>${moves}</strong> <span>moves</span></p>
            <p class="play-result-copy">All ${pairs} pairs found, and ${bonus} bonus eco points banked.</p>
            ${isBest ? '<p class="play-result-flag">New personal best on this board.</p>' : ''}
            ${earned.length ? `<p class="play-result-flag">Badge unlocked: ${earned.map(b => escapeArcadeText(b.label)).join(', ')}</p>` : ''}
            <div class="play-lb-slot" id="lb-submit-memory"></div>
            <div class="play-stage-actions">
                <button type="button" class="play-primary-btn" id="memory-again-btn">Deal again</button>
                <button type="button" class="play-ghost-btn" id="memory-level-btn">Change board size</button>
            </div>
        </div>`;

    arcadeSound('win');
    mountArcadeScoreSubmit('lb-submit-memory', `memory-${level}`, moves);

    const againBtn = document.getElementById('memory-again-btn');
    if (againBtn) againBtn.addEventListener('click', () => startMemoryGame(level));
    const levelBtn = document.getElementById('memory-level-btn');
    if (levelBtn) levelBtn.addEventListener('click', () => renderMemoryStart(level));
}

/* ============================================================
   TABS, LIFECYCLE AND BOOT
   ============================================================ */

function switchArcadeGame(gameId) {
    const tabs = document.querySelectorAll('.play-tab');
    const panels = document.querySelectorAll('.play-panel');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        const isActive = tab.getAttribute('data-game') === gameId;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach(panel => {
        const isActive = panel.id === `play-panel-${gameId}`;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
    });

    // Leaving the sorting game mid-run would otherwise leave its interval
    // ticking against a board nobody can see.
    if (gameId !== 'sort' && sortRun) {
        stopSortTimer();
        sortRun = null;
        renderSortStart();
    }
}

// Called by the router when the visitor navigates away from /play, and on tab
// hide. A countdown that keeps running while the page is in the background is
// a score the player never had a chance to defend.
function pauseEcoArcade() {
    if (!sortRun) return;
    stopSortTimer();
    sortRun = null;
    renderSortStart();
}

let arcadeInitialised = false;

function initEcoArcade() {
    if (arcadeInitialised) return;
    const shell = document.getElementById('view-play');
    if (!shell) return;
    arcadeInitialised = true;

    renderArcadeScoreboard();
    renderTriviaStart();
    renderSortStart();
    renderMemoryStart();
    if (typeof initLeaderboard === 'function') initLeaderboard();

    const tabs = Array.from(document.querySelectorAll('.play-tab'));
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => switchArcadeGame(tab.getAttribute('data-game')));
        // Arrow keys are how a tablist is expected to move; without them the
        // roles in the markup would be describing behaviour that is not there.
        tab.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            e.preventDefault();
            const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
            next.focus();
            switchArcadeGame(next.getAttribute('data-game'));
        });
    });

    const resetBtn = document.getElementById('play-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetArcadeProgress);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) pauseEcoArcade();
    });
}

window.initEcoArcade = initEcoArcade;
window.pauseEcoArcade = pauseEcoArcade;
window.switchArcadeGame = switchArcadeGame;
window.resetArcadeProgress = resetArcadeProgress;

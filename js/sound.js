// --- UI Sound Module ---
//
// Every sound on this site is synthesised in the browser with the Web Audio
// API. There are no .mp3 or .wav files to download, which is the whole point:
// a set of UI clicks shipped as audio files is 100KB or more of assets that
// have to be fetched, cached and served before the first tap makes a noise.
// An oscillator and a gain envelope cost nothing and are instant.
//
// Two rules the rest of the site depends on:
//
//   1. Sound is off until someone turns it on. A page that makes noise the
//      moment it loads is hostile, and browsers block it anyway: an
//      AudioContext created outside a user gesture starts suspended. The
//      toggle in the header is the gesture that starts it.
//   2. Nothing here ever blocks. If the browser has no Web Audio at all, every
//      call becomes a no-op and the click still does what it was going to do.
//
// To make sound on by default for new visitors, change SOUND_DEFAULT_ON to
// true. Everyone who has already used the toggle keeps their own choice.

const SOUND_STORE_KEY = 'green-rising-sound';
const SOUND_DEFAULT_ON = false;

// Master level for everything below. UI clicks want to sit under the content,
// not announce themselves, so this is deliberately quiet.
const SOUND_MASTER_GAIN = 0.16;

let audioCtx = null;
let masterGain = null;
let soundEnabled = false;
let lastPlayed = { name: null, at: 0 };

/* ============================================================
   THE VOICES
   Each entry is a list of notes. A note is a frequency, a wave
   shape and an envelope; `slideTo` bends the pitch across the
   note, which is what separates a rising "correct" from a
   sagging "wrong" without needing two different instruments.
   ============================================================ */
const SOUND_PATTERNS = {
    // Generic interface tick. Short enough to feel like part of the tap.
    click:   [{ freq: 620, type: 'triangle', dur: 0.045, gain: 0.5 }],
    // Something changed state: a tab, a toggle, an option card.
    select:  [{ freq: 520, type: 'sine', dur: 0.07, gain: 0.55, slideTo: 720 }],
    // Page-level navigation.
    nav:     [{ freq: 440, type: 'sine', dur: 0.09, gain: 0.5, slideTo: 660 }],
    correct: [
        { freq: 660, type: 'sine', dur: 0.09, gain: 0.6 },
        { freq: 990, type: 'sine', dur: 0.16, gain: 0.55, delay: 0.075 }
    ],
    wrong:   [{ freq: 200, type: 'sawtooth', dur: 0.22, gain: 0.35, slideTo: 120, filter: 900 }],
    flip:    [{ freq: 900, type: 'triangle', dur: 0.035, gain: 0.35 }],
    match:   [
        { freq: 660, type: 'sine', dur: 0.08, gain: 0.5 },
        { freq: 880, type: 'sine', dur: 0.08, gain: 0.5, delay: 0.07 },
        { freq: 1320, type: 'sine', dur: 0.2, gain: 0.45, delay: 0.14 }
    ],
    // The last few seconds of the sorting run.
    tick:    [{ freq: 1180, type: 'sine', dur: 0.03, gain: 0.22 }],
    win:     [
        { freq: 523, type: 'triangle', dur: 0.1, gain: 0.5 },
        { freq: 659, type: 'triangle', dur: 0.1, gain: 0.5, delay: 0.1 },
        { freq: 784, type: 'triangle', dur: 0.1, gain: 0.5, delay: 0.2 },
        { freq: 1047, type: 'triangle', dur: 0.32, gain: 0.5, delay: 0.3 }
    ],
    timeup:  [{ freq: 440, type: 'sawtooth', dur: 0.45, gain: 0.3, slideTo: 180, filter: 1200 }],
    badge:   [
        { freq: 784, type: 'sine', dur: 0.1, gain: 0.5 },
        { freq: 1175, type: 'sine', dur: 0.28, gain: 0.45, delay: 0.09 }
    ]
};

/* ============================================================
   ENGINE
   ============================================================ */

function readStoredSoundPreference() {
    try {
        const stored = localStorage.getItem(SOUND_STORE_KEY);
        if (stored === 'on') return true;
        if (stored === 'off') return false;
    } catch (err) {
        // Private windows can throw on access. Fall through to the default.
    }
    return SOUND_DEFAULT_ON;
}

function ensureAudioContext() {
    if (audioCtx) return audioCtx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
        audioCtx = new Ctx();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = SOUND_MASTER_GAIN;
        masterGain.connect(audioCtx.destination);
    } catch (err) {
        console.warn('[sound] Web Audio unavailable:', err);
        audioCtx = null;
    }
    return audioCtx;
}

function playNote(note, startAt) {
    const ctx = audioCtx;
    const begin = startAt + (note.delay || 0);
    const dur = note.dur || 0.08;
    const peak = (note.gain === undefined ? 0.5 : note.gain);

    const osc = ctx.createOscillator();
    osc.type = note.type || 'sine';
    osc.frequency.setValueAtTime(note.freq, begin);
    if (note.slideTo) {
        // Linear rather than exponential: a slide to a much lower pitch reads
        // as a slump, and exponentialRampToValueAtTime cannot reach zero or
        // cross it cleanly anyway.
        osc.frequency.linearRampToValueAtTime(note.slideTo, begin + dur);
    }

    const env = ctx.createGain();
    // A square-edged envelope clicks audibly on its own. 8ms of attack and a
    // ramp to near-silence is what makes these read as tones rather than pops.
    env.gain.setValueAtTime(0.0001, begin);
    env.gain.linearRampToValueAtTime(peak, begin + Math.min(0.008, dur / 3));
    env.gain.exponentialRampToValueAtTime(0.0001, begin + dur);

    let tail = env;
    if (note.filter) {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = note.filter;
        env.connect(lp);
        tail = lp;
    }

    osc.connect(env);
    tail.connect(masterGain);
    osc.start(begin);
    osc.stop(begin + dur + 0.02);
}

// The one call the rest of the site makes. Safe to call at any time, whether
// or not sound is on, whether or not the browser supports it.
function playSound(name) {
    if (!soundEnabled) return;
    const pattern = SOUND_PATTERNS[name];
    if (!pattern) return;
    // There is deliberately no `document.hidden` check here. Every sound on
    // the site is triggered by a click, and a background tab cannot be
    // clicked; the one timer-driven sound belongs to the sorting run, which
    // js/play.js already retires when the page is hidden. Meanwhile an
    // embedded view can report visibilityState 'hidden' while sitting in
    // front of the person using it, and a guard here would mute it for no
    // reason they could see.
    //
    // A label wrapping a radio fires two clicks for one tap, so the same
    // sound is refused twice inside 60ms.
    const now = Date.now();
    if (lastPlayed.name === name && now - lastPlayed.at < 60) return;
    lastPlayed = { name, at: now };

    const ctx = ensureAudioContext();
    if (!ctx) return;
    // Safari and Chrome suspend the context when it is created outside a
    // gesture, and again when the tab sleeps. Resuming inside a real click is
    // allowed, and is why this lives here rather than at boot.
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    try {
        const start = ctx.currentTime + 0.001;
        pattern.forEach(note => playNote(note, start));
    } catch (err) {
        console.warn('[sound] could not play', name, err);
    }
}

/* ============================================================
   THE TOGGLE
   ============================================================ */

const SOUND_ICON_ON = '<svg class="sound-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z"></path><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 5.5a9 9 0 0 1 0 13"></path></svg>';
const SOUND_ICON_OFF = '<svg class="sound-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z"></path><path d="m17 9 4 6"></path><path d="m21 9-4 6"></path></svg>';

function renderSoundToggles() {
    document.querySelectorAll('.sound-toggle-pill').forEach(btn => {
        btn.innerHTML = soundEnabled ? SOUND_ICON_ON : SOUND_ICON_OFF;
        btn.setAttribute('aria-pressed', String(soundEnabled));
        const label = soundEnabled ? 'Sound on. Turn sound off' : 'Sound off. Turn sound on';
        btn.setAttribute('aria-label', label);
        btn.setAttribute('title', label);
        btn.classList.toggle('is-on', soundEnabled);
    });
}

function setSoundEnabled(on) {
    soundEnabled = !!on;
    try {
        localStorage.setItem(SOUND_STORE_KEY, soundEnabled ? 'on' : 'off');
    } catch (err) {
        // Preference cannot be remembered here; it still applies to this visit.
    }
    renderSoundToggles();
    // Confirm the new state in the medium it controls. Switching sound on and
    // hearing nothing is indistinguishable from a broken toggle.
    if (soundEnabled) playSound('select');
}

function toggleSound() {
    setSoundEnabled(!soundEnabled);
}

function isSoundEnabled() {
    return soundEnabled;
}

/* ============================================================
   SITE-WIDE CLICKS
   ============================================================ */

// One delegated listener rather than a handler per control, so anything added
// to the page later is covered without being wired up. The capture phase is
// deliberate: a handler that calls stopPropagation (the video modal does)
// would otherwise swallow the sound along with the event.
function initSoundEffects() {
    soundEnabled = readStoredSoundPreference();
    renderSoundToggles();

    document.querySelectorAll('.sound-toggle-pill').forEach(btn => {
        btn.addEventListener('click', toggleSound);
    });

    document.addEventListener('click', (e) => {
        if (!soundEnabled) return;
        const target = e.target instanceof Element ? e.target : null;
        if (!target) return;

        // The toggle plays its own confirmation; a second click on top of it
        // would double up.
        if (target.closest('.sound-toggle-pill')) return;

        // Controls that answer for themselves. js/play.js plays a verdict for
        // every answer, bin and tile, and a generic click on top of it would
        // be two sounds for one tap. Every other control in the arcade (tabs,
        // start buttons, board chips) still clicks like the rest of the site.
        if (target.closest('.play-answer, .play-bin, .memory-tile')) return;

        const control = target.closest(
            'a[href], button, [role="button"], [role="tab"], .quiz-option-card, summary'
        );
        if (!control || control.hasAttribute('disabled')) return;

        playSound(control.matches('a.nav-link, .nav-apply-btn, .floating-apply-btn') ? 'nav' : 'click');
    }, true);
}

window.playSound = playSound;
window.toggleSound = toggleSound;
window.setSoundEnabled = setSoundEnabled;
window.isSoundEnabled = isSoundEnabled;
window.initSoundEffects = initSoundEffects;

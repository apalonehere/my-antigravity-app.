// Green Rising Barbados - logo mark entrance.
//
// Fires once per browser session, not on every page view and not on every
// client-side route change. A header logo that replays its entrance every time
// someone clicks a nav link stops being charming almost immediately.
//
// The animation itself is CSS (see "LOGO MARK - motion" in index.css); this
// only decides whether to add the class. Under prefers-reduced-motion it does
// nothing at all, and the CSS also refuses to animate, so the intent is stated
// in both places rather than relying on either alone.

function initLogoIntro() {
    const lockup = document.getElementById('nav-logo');
    if (!lockup) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let alreadyPlayed = false;
    try {
        alreadyPlayed = sessionStorage.getItem('gr_logo_intro') === 'done';
    } catch (e) {
        // Private windows and blocked site data throw here. Treat it as
        // "not played" - a second animation is a far smaller problem than
        // a crash in the boot sequence.
        alreadyPlayed = false;
    }

    if (alreadyPlayed) return;

    lockup.classList.add('logo-intro');
    try { sessionStorage.setItem('gr_logo_intro', 'done'); } catch (e) {}

    // Drop the class once the entrance has run, so the hover sweep is not
    // competing with a finished animation still holding its end state.
    //
    // A timeout rather than an animationend listener: the sweep lives on a
    // ::after pseudo-element, and its animationend did not reliably reach a
    // listener on the anchor. The duration is known and fixed in CSS, so
    // waiting it out is both simpler and deterministic. Kept slightly longer
    // than rise (620) + sweep delay (380) + sweep (900).
    setTimeout(function () {
        lockup.classList.remove('logo-intro');
    }, 2100);
}

window.initLogoIntro = initLogoIntro;

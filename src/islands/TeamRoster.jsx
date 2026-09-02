// Meet the Team - the roster spine.
//
// Shares the editorial grammar of Tomorrow's Reef (eyebrow → headline →
// standfirst, full-bleed rhythm, one readable text measure) but deliberately
// NOT its mechanic. The reef story is scroll-driven: you fall through it and
// the media changes under you. A five-person team has no media to fall
// through - there are no portraits for these people, only monograms - so a
// scroll spine would be five near-empty screens.
//
// Instead the roster is pointer/keyboard-driven: a list of names on the left,
// a dossier that crossfades on the right. Same editorial voice, different
// verb. That is what makes it feel of a piece without being a copy.
//
// Accessibility notes (ui-ux-pro-max, Priority 1 & 2):
//   - Rows are real <button>s in a roving-tabindex listbox, so the whole
//     roster is one tab stop and Up/Down/Home/End move within it.
//   - Selection is driven by click/focus, never hover alone - hover has no
//     meaning on touch (UX rule "Hover vs Tap", severity High).
//   - Under 900px the dossier collapses into the row itself, because a
//     sticky side panel off-screen is not a panel.
//   - prefers-reduced-motion drops the crossfade to an instant swap.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/* Monogram from the name, so the data stays the single source of truth. */
function monogram(name) {
  return name
    .replace(/^(Dr|Mr|Mrs|Ms|Prof)\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function Dossier({ member, reduced }) {
  const duration = reduced ? 0 : 0.32;

  return (
    <motion.article
      key={member.name}
      className="roster-dossier"
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -8 }}
      /* Exit is faster than enter - the outgoing card should get out of the
         way rather than linger under the incoming one. */
      transition={{ duration, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <div className="roster-dossier-head">
        <span className="roster-monogram" aria-hidden="true">{monogram(member.name)}</span>
        <div>
          <h3 className="roster-dossier-name">{member.name}</h3>
          <p className="roster-dossier-role">{member.role}</p>
        </div>
      </div>

      <p className="roster-dossier-bio">{member.bio}</p>

      {member.focus?.length > 0 && (
        <div className="roster-dossier-focus">
          <h4 className="roster-focus-label">Focus</h4>
          <ul className="roster-focus-list">
            {member.focus.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.article>
  );
}

export default function TeamRoster({ members = [] }) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const rowRefs = useRef([]);
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const onChange = (e) => setIsNarrow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const move = useCallback(
    (next) => {
      const clamped = (next + members.length) % members.length;
      setIndex(clamped);
      rowRefs.current[clamped]?.focus();
    },
    [members.length]
  );

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); move(index + 1); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); move(index - 1); }
    if (e.key === 'Home') { e.preventDefault(); move(0); }
    if (e.key === 'End') { e.preventDefault(); move(members.length - 1); }
  };

  if (!members.length) return null;

  return (
    <div className={'roster' + (isNarrow ? ' roster--stacked' : '')}>
      <ul
        className="roster-list"
        role="listbox"
        aria-label="Green Rising team members"
        aria-activedescendant={`roster-row-${index}`}
        onKeyDown={onKeyDown}
      >
        {members.map((m, i) => {
          const active = i === index;
          return (
            <li key={m.name} className="roster-row-wrap">
              <button
                type="button"
                id={`roster-row-${i}`}
                ref={(el) => { rowRefs.current[i] = el; }}
                className={'roster-row' + (active ? ' is-active' : '')}
                role="option"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onClick={() => setIndex(i)}
                onFocus={() => setIndex(i)}
                /* Pointer hover selects too, but only on devices that
                   genuinely hover - see the media query in index.css. */
                onMouseEnter={() => { if (!isNarrow) setIndex(i); }}
              >
                <span className="roster-row-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="roster-row-text">
                  <span className="roster-row-name">{m.name}</span>
                  <span className="roster-row-role">{m.role}</span>
                </span>
                <span className="roster-row-mark" aria-hidden="true" />
              </button>

              {/* Narrow screens: the dossier lives inside the row it belongs
                  to, so the answer is never off-screen from the question. */}
              {isNarrow && active && (
                <AnimatePresence mode="wait" initial={false}>
                  <Dossier member={m} reduced={reduced} />
                </AnimatePresence>
              )}
            </li>
          );
        })}
      </ul>

      {!isNarrow && (
        <div className="roster-panel">
          <AnimatePresence mode="wait" initial={false}>
            <Dossier member={members[index]} reduced={reduced} />
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

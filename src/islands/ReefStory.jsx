// Tomorrow's Reef — the story spine.
//
// Adapted from 21st.dev "Scroll 01" by @felipemenezes098
// https://21st.dev/@felipemenezes098/components/scroll-01
//
// Changes from the original, and why:
//   1. `motion/react` -> `framer-motion`. The site has framer-motion 13.1.1
//      installed; the `motion` package is not present.
//   2. TSX -> JSX (no type layer in this project).
//   3. The original centres text over a max-w-4xl page. Here the media column
//      bleeds to the screen edge and the text column is capped at a readable
//      measure, which is the whole point of the redesign: the previous layout
//      letterboxed portrait photos by 60% and left the sides of the screen
//      empty.
//   4. Media uses object-fit: cover with a per-item focal point, so a portrait
//      photo fills a tall column instead of floating in a landscape box.
//   5. The compare slider gives the section an interactive beat
//      rather than it being image-only.
//
// No GSAP here. The pin was removed for this section: sticky positioning plus
// Framer's scroll progress does the whole job, and running one scroll system
// instead of two removes the class of bug that cost us earlier.

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

/* ---------------------------------------------------------------
   Drag-to-compare: wipe between two images.
   Pointer, touch and keyboard all drive the same value.
   --------------------------------------------------------------- */
function CompareSlider({ before, after, beforeAlt, afterAlt, beforeLabel, afterLabel }) {
  const [pct, setPct] = useState(50);
  const wrapRef = useRef(null);
  const draggingRef = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const next = ((clientX - r.left) / r.width) * 100;
    setPct(Math.min(100, Math.max(0, next)));
  }, []);

  useEffect(() => {
    const move = (e) => {
      if (!draggingRef.current) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setFromClientX(x);
    };
    const up = () => { draggingRef.current = false; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [setFromClientX]);

  const onKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === 'ArrowLeft') { e.preventDefault(); setPct(p => Math.max(0, p - step)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setPct(p => Math.min(100, p + step)); }
    if (e.key === 'Home') { e.preventDefault(); setPct(0); }
    if (e.key === 'End') { e.preventDefault(); setPct(100); }
  };

  return (
    <div
      className="reef-compare"
      ref={wrapRef}
      onPointerDown={(e) => { draggingRef.current = true; setFromClientX(e.clientX); }}
    >
      <img className="reef-compare-img" src={after} alt={afterAlt} loading="lazy" decoding="async" />
      {/* clip-path rather than a width-constrained wrapper: a narrowing wrapper
          squashes the image instead of revealing it */}
      <img
        className="reef-compare-img reef-compare-img--before"
        src={before}
        alt={beforeAlt}
        loading="lazy"
        decoding="async"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      />

      <span className="reef-compare-tag reef-compare-tag--left" aria-hidden="true">{beforeLabel}</span>
      <span className="reef-compare-tag reef-compare-tag--right" aria-hidden="true">{afterLabel}</span>

      <div
        className="reef-compare-handle"
        style={{ left: `${pct}%` }}
        role="slider"
        tabIndex={0}
        aria-label={`Compare ${beforeLabel} with ${afterLabel}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-valuetext={`${Math.round(pct)}% ${beforeLabel}`}
        onKeyDown={onKeyDown}
      >
        <span className="reef-compare-grip" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   One text beat. Reports itself as active when it reaches the
   middle of the viewport, which is what swaps the sticky media.
   --------------------------------------------------------------- */
function Beat({ item, index, setActive }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 15%'] });

  const y = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.28, 0.72, 1],
    index === 0 ? [1, 1, 1, 0.25] : [0.25, 1, 1, 0.25]
  );

  const isActive = useTransform(scrollYProgress, v => v > 0.35 && v < 0.65);
  useMotionValueEvent(isActive, 'change', v => {
    if (v) setActive(prev => (prev === index ? prev : index));
  });

  return (
    <motion.article ref={ref} style={{ opacity, y }} className="reef-beat">
      <span className="reef-beat-step">{String(index + 1).padStart(2, '0')}</span>
      <h3 className="reef-beat-title">{item.title}</h3>
      <p className="reef-beat-body">{item.body}</p>
      {item.note && <p className="reef-beat-note">{item.note}</p>}
    </motion.article>
  );
}

export default function ReefStory({ items = [], compare }) {
  const [active, setActive] = useState(0);
  if (!items.length) return null;

  return (
    <div className="reef-story">

      {/* Stacked on small screens: each beat with its own photo, in order. */}
      <div className="reef-story-stacked">
        {items.map((item, i) => (
          <article className="reef-beat reef-beat--stacked" key={`s_${i}`}>
            <img src={item.media} alt={item.alt} loading="lazy" decoding="async"
                 style={{ objectPosition: item.focus || 'center' }} />
            <span className="reef-beat-step">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="reef-beat-title">{item.title}</h3>
            <p className="reef-beat-body">{item.body}</p>
            {item.note && <p className="reef-beat-note">{item.note}</p>}
          </article>
        ))}
      </div>

      {/* Split: media bleeds to the edge, text keeps a readable measure. */}
      <div className="reef-story-split">
        <div className="reef-story-media">
          {items.map((item, i) => (
            <motion.img
              key={`m_${i}`}
              src={item.media}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: item.focus || 'center' }}
              initial={{ opacity: i === 0 ? 1 : 0 }}
              animate={{ opacity: active === i ? 1 : 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          ))}
          <span className="reef-story-counter" aria-hidden="true">
            {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
        </div>

        <div className="reef-story-text">
          {items.map((item, i) => (
            <Beat key={`b_${i}`} item={item} index={i} setActive={setActive} />
          ))}
        </div>
      </div>

      {/* Interactive beats sit after the scroll spine, full width. */}
      {compare && (
        <section className="reef-interactive">
          <h3 className="reef-interactive-title">{compare.title}</h3>
          <p className="reef-interactive-hint">Drag, or use the arrow keys.</p>
          <CompareSlider {...compare} />
        </section>
      )}

    </div>
  );
}

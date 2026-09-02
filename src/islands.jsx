// React island mounter.
//
// The site is plain HTML and stays that way. This file lets a single React
// component be dropped into it, which is what makes 21st.dev components usable
// - they ship as TSX and need compiling, so they cannot be pasted into a
// vanilla page directly.
//
// Usage in index.html:
//   <div data-island="StoryScroll" data-props='{"items":[...]}'></div>
//
// Register the component below, run `npm run build:islands`, done.

import React from 'react';
import { createRoot } from 'react-dom/client';

import ReefStory from './islands/ReefStory.jsx';
import TeamRoster from './islands/TeamRoster.jsx';

// Every component that may be mounted from markup.
//
// StoryScroll is ReefStory under a neutral name. The component is not
// reef-specific - it takes items and renders a sticky media column against a
// scrolling text column - and reusing it for Eco-Leaders keeps one verified
// scroll implementation on the Programmes page instead of two competing ones.
const REGISTRY = {
  ReefStory,
  StoryScroll: ReefStory,
  TeamRoster
};

function mountAll() {
  document.querySelectorAll('[data-island]').forEach((el) => {
    if (el.dataset.islandMounted === 'true') return;

    const name = el.dataset.island;
    const Component = REGISTRY[name];

    if (!Component) {
      console.warn(`[islands] no component registered as "${name}"`);
      return;
    }

    let props = {};
    if (el.dataset.props) {
      try {
        props = JSON.parse(el.dataset.props);
      } catch {
        console.warn(`[islands] data-props on "${name}" is not valid JSON`);
      }
    }

    el.dataset.islandMounted = 'true';
    createRoot(el).render(<Component {...props} />);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}

// The site is a client-routed SPA; views are shown and hidden rather than
// re-rendered, but a newly revealed island still needs mounting.
window.addEventListener('hashchange', () => requestAnimationFrame(mountAll));
window.mountIslands = mountAll;

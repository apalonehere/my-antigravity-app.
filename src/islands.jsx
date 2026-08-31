// React island mounter.
//
// The site is plain HTML and stays that way. This file lets a single React
// component be dropped into it, which is what makes 21st.dev components usable
// — they ship as TSX and need compiling, so they cannot be pasted into a
// vanilla page directly.
//
// Usage in index.html:
//   <div data-island="DotField" data-props='{"speed":0.4}'></div>
//
// Register the component below, run `npm run build:islands`, done.

import React from 'react';
import { createRoot } from 'react-dom/client';

import DotField from './islands/DotField.jsx';

// Every component that may be mounted from markup
const REGISTRY = {
  DotField
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

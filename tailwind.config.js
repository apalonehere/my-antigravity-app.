/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './js/**/*.js',
    './app.js',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  // Preflight is Tailwind's CSS reset. index.css is a complete hand-written
  // stylesheet written against the browser defaults, and the CDN build was
  // already applying preflight, so it stays on to keep rendering identical.
  corePlugins: {
    preflight: true
  },
  theme: {
    extend: {}
  },
  plugins: []
};

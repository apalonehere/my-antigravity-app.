import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Builds the React "islands" bundle only — it does NOT build the site.
//
// index.html stays a plain hand-written page served as-is. This bundle is one
// extra <script> that mounts React components into specific <div>s, so 21st.dev
// components (which ship as TSX and need compiling) can be used without
// migrating the rest of the site.
//
//   npm run build:islands   -> js/islands.js
//   npm run dev:islands     -> rebuild on save
export default defineConfig({
  plugins: [react()],
  // React checks process.env.NODE_ENV at runtime. There is no `process` in a
  // browser IIFE, so without this the bundle throws "process is not defined"
  // before it can mount anything.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}'
  },
  resolve: {
    // shadcn / 21st components import from "@/components/..."
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/islands.jsx'),
      name: 'GreenRisingIslands',
      formats: ['iife'],
      fileName: () => 'islands.js'
    },
    outDir: 'js',
    emptyOutDir: false, // js/ holds the hand-written scripts too
    sourcemap: false,
    rollupOptions: {
      output: {
        // Single self-contained file, no code splitting — it is loaded by a
        // plain <script> tag, not an ES module graph
        inlineDynamicImports: true
      }
    }
  }
});

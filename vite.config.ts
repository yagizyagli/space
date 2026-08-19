import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Enforces relative asset paths so it opens perfectly on GitHub Pages
  base: './',
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@space/core': resolve(__dirname, './packages/core/src/index.ts'),
      '@space/database': resolve(__dirname, './packages/database/src/index.ts'),
      '@space/physics': resolve(__dirname, './packages/physics/src/index.ts'),
      '@space/render': resolve(__dirname, './packages/render/src/index.ts'),
      '@space/telemetry': resolve(__dirname, './packages/telemetry/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true,
    // Configuration optimized for generating the web application for GitHub Pages
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  }
});

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: true,
    // FORCE CONFIGURATION: Solves the browser 'video/mp2t' MIME type validation error
    headers: {
      'Content-Type': 'text/javascript',
    },
    // Explicitly configures server middleware to map TS files as executable script modules
    fs: {
      strict: false
    }
  },
  resolve: {
    alias: {
      '@space/core': resolve(__dirname, './packages/core/src/index.ts'),
      '@space/database': resolve(__dirname, './packages/database/src/index.ts'),
      '@space/physics': resolve(__dirname, './packages/physics/src/index.ts'),
      '@space/render': resolve(__dirname, './packages/render/src/index.ts'),
      '@space/telemetry': resolve(__dirname, './packages/telemetry/src/index.ts'),
    },
  }
});

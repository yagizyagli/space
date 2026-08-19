import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@space/core': resolve(__dirname, './packages/core/src'),
      '@space/database': resolve(__dirname, './packages/database/src'),
      '@space/physics': resolve(__dirname, './packages/physics/src'),
      '@space/render': resolve(__dirname, './packages/render/src'),
      '@space/telemetry': resolve(__dirname, './packages/telemetry/src'),
    },
  }
});

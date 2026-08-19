import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
    lib: {
      entry: resolve(__dirname, './packages/core/src/index.ts'),
      name: 'Space',
      fileName: (format) => `space.${format}.js`,
      formats: ['es', 'umd']
    }
  }
});

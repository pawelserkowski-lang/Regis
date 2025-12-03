import { spawn, type ChildProcess } from 'node:child_process';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',                    // ← BEZWZGLĘDNIE WAŻNE!
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: '.',
    sourcemap: false,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});

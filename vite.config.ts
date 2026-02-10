/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    exclude: ['node_modules', '.worktrees'],
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate heavy audio library
          'tone': ['tone'],
          // Separate React core
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
});

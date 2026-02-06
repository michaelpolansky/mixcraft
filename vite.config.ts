import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
          // Separate challenge data
          'challenge-data': [
            './src/data/challenges/index.ts',
            './src/data/challenges/mixing/index.ts',
            './src/data/challenges/production/index.ts',
          ],
        },
      },
    },
  },
});

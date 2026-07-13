import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Hot Module Replacement (HMR) configuration based on DISABLE_HMR environment variable.
      // File watching is configured to avoid flickering during local code updates.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save system resource overhead.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

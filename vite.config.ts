import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      googleapis: '/src/empty-module.ts',
      'google-auth-library': '/src/empty-module.ts',
      'gcp-metadata': '/src/empty-module.ts',
      nodemailer: '/src/empty-module.ts'
    }
  },
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
  }
});

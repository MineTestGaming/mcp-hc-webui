import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// MPC-HC "Serve pages from" serves static files as-is.
// Relative base ensures all assets resolve correctly under any path.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      // During dev, proxy API calls to MPC-HC running on port 13579
      '/browser.html': 'http://localhost:13579',
      '/command.html': 'http://localhost:13579',
      '/status.html': 'http://localhost:13579',
      '/variables.html': 'http://localhost:13579',
      '/info.html': 'http://localhost:13579',
      '/snapshot.jpg': 'http://localhost:13579',
    },
  },
});

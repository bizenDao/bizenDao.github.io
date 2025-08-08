import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['ethers', '@metamask/sdk'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['ethers', '@metamask/sdk'],
  },
  server: {
    host: true,
    port: 3000,
  },
});
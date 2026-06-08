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
    build: {
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
      cssMinify: true,
      sourcemap: 'hidden',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Group React core vendor
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              // Group QR-related modules
              if (id.includes('qrcode') || id.includes('qr-scanner')) {
                return 'vendor-qr';
              }
              // Group Firebase modules
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              // Group Icons
              if (id.includes('lucide-react')) {
                return 'icons';
              }
              // Group Animations
              if (id.includes('motion') || id.includes('framer-motion')) {
                return 'animations';
              }
              // Group Charts
              if (id.includes('recharts') || id.includes('d3')) {
                return 'charts';
              }
              // Fallback libs chunk
              return 'vendor-libs';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom', 'react-dom/client', 'scheduler'],
    },
    build: {
      target: 'es2022',
      minify: 'esbuild' as const,
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Strictly isolate React core runtime and scheduler to prevent circular chunk references and undefined Activity errors
              if (/[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store|react-is)[\\/]/.test(id)) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              if (id.includes('jspdf') || id.includes('pdfkit') || id.includes('jszip')) {
                return 'vendor-documents';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('qrcode') || id.includes('jsbarcode') || id.includes('react-barcode')) {
                return 'vendor-qr';
              }
              return 'vendor-others';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in iSolutions via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

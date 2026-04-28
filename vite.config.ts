import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const isSingleFile = mode === 'singlefile';

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isSingleFile ? [viteSingleFile()] : []),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      ...(isSingleFile ? {
        assetsInlineLimit: 100000000,
        cssCodeSplit: false,
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
          },
        },
      } : {
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-motion': ['motion/react'],
              'vendor-pdf': ['jspdf', 'html2canvas'],
              'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            },
          },
        },
      }),
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

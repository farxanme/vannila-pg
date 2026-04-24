import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        receipt: resolve(__dirname, 'src/receipt.html'),
        redirect: resolve(__dirname, 'src/redirect.html')
      },
      output: {
        entryFileNames: 'assets/js/[name].js',
        chunkFileNames: 'assets/js/[name].js',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor-base';
          }
          if (id.includes('/src/assets/js/pages/')) {
            return 'page-runtime';
          }
          if (id.includes('/src/assets/js/')) {
            return 'app-base';
          }
          return null;
        },
        assetFileNames: (assetInfo) => {
          const assetName = assetInfo.name || '';
          if (assetName.endsWith('.css')) {
            return 'assets/css/[name][extname]';
          }
          if (/\.(woff2?|ttf|otf|eot)$/i.test(assetName)) {
            return 'assets/fonts/[name][extname]';
          }
          return 'assets/[name][extname]';
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    hot: true,
    proxy: {
      // auth.sep.ir captcha (CORS) — use: fetch('/sep-auth/api/v1/captcha')
      '/sep-auth': {
        target: 'https://auth.sep.ir',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/sep-auth/, ''),
      },
    },
  },
});

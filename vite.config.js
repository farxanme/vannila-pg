import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cp, rm, stat } from 'node:fs/promises';

function copyImagesWithStructurePlugin() {
  return {
    name: 'copy-images-with-structure',
    apply: 'build',
    async closeBundle() {
      const sourceImagesPath = resolve(__dirname, 'src/assets/images');
      const outputImagesPath = resolve(__dirname, 'dist/assets/images');

      try {
        await stat(sourceImagesPath);
      } catch {
        return;
      }

      await rm(outputImagesPath, { recursive: true, force: true });
      await cp(sourceImagesPath, outputImagesPath, { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [copyImagesWithStructurePlugin()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        receipt: resolve(__dirname, 'src/receipt.html'),
        redirect: resolve(__dirname, 'src/redirect.html'),
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
          if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(assetName)) {
            return 'assets/images/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
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

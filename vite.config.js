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

function appendStaticAssetVersionPlugin() {
  const assetUrlRegex = /\/assets\/[^\s"'`)<]+?\.(?:css|js|svg)(?!\?)/g;
  const buildVersion = Date.now().toString(36);

  const addVersion = (content) =>
    content.replace(assetUrlRegex, (url) => `${url}?v=${buildVersion}`);

  return {
    name: 'append-static-asset-version',
    apply: 'build',
    generateBundle(_options, bundle) {
      Object.values(bundle).forEach((item) => {
        if (item.type === 'chunk') {
          item.code = addVersion(item.code);
          return;
        }

        if (typeof item.source === 'string') {
          const isTextAsset = /\.(html|css|js)$/i.test(item.fileName);
          if (isTextAsset) {
            item.source = addVersion(item.source);
          }
        }
      });
    },
  };
}

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  const mockAlias = isBuild
    ? {
        [resolve(__dirname, 'src/assets/js/mocks/ipgMocks.js')]: resolve(
          __dirname,
          'src/assets/js/mocks-disabled/ipgMocks.js'
        ),
        [resolve(__dirname, 'src/assets/js/mocks/captchaMocks.js')]: resolve(
          __dirname,
          'src/assets/js/mocks-disabled/captchaMocks.js'
        ),
      }
    : {};

  return {
    root: 'src',
    envDir: '..',
    publicDir: '../public',
    plugins: [copyImagesWithStructurePlugin(), appendStaticAssetVersionPlugin()],
    resolve: {
      alias: mockAlias,
    },
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      cssCodeSplit: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/index.html'),
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
  };
});

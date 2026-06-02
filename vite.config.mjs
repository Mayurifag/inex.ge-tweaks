import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { minify as minifyJs } from 'rolldown/utils';
import { minifyCss, stripUserStyle } from './scripts/userstyle-css.mjs';

const ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZD0iTTMyIDQgTDU4IDE3IFY0NyBMMzIgNjAgTDYgNDcgVjE3IFogTTYgMTcgTDMyIDMwIEw1OCAxNyBNMzIgMzAgVjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDY2Y2MiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==';
const USERSCRIPT_URL =
  'https://github.com/Mayurifag/inex.ge-tweaks/raw/refs/heads/dist/inex.ge-tweaks.user.js';

function outputFileName() {
  return 'inex.ge-tweaks.user.js';
}

function rawCssModuleValue(code) {
  return JSON.parse(code.slice('export default '.length).replace(/;$/, ''));
}

async function minifyUserscript(code) {
  const end = '// ==/UserScript==';
  const i = code.indexOf(end);
  if (i < 0) return (await minifyJs(outputFileName(), code, {})).code;

  const headerEnd = i + end.length;
  const header = code.slice(0, headerEnd);
  const body = code.slice(headerEnd).trim();
  const minified = (await minifyJs(outputFileName(), body, {})).code;
  return `${header}\n${minified}`;
}

export default defineConfig({
  plugins: [
    {
      name: 'strip-userstyle-raw',
      enforce: 'pre',
      transform(code, id) {
        if (!id.includes('/src/dark.user.css?raw')) return null;
        return { code: `export default ${JSON.stringify(stripUserStyle(code))};`, map: null };
      },
    },
    {
      name: 'minify-raw-css',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('.css?raw') || id.includes('/src/dark.user.css?raw')) return null;
        return {
          code: `export default ${JSON.stringify(minifyCss(rawCssModuleValue(code)))};`,
          map: null,
        };
      },
    },
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'inex.ge tweaks',
        namespace: 'https://github.com/Mayurifag/inex.ge-tweaks',
        description: 'Userscript tweaks for inex.ge.',
        match: ['https://inex.ge/*'],
        updateURL: USERSCRIPT_URL,
        downloadURL: USERSCRIPT_URL,
        'run-at': 'document-start',
        noframes: true,
        icon: ICON,
      },
      build: {
        fileName: outputFileName(),
      },
      server: {
        open: false,
      },
    }),
    {
      name: 'minify-userscript-output',
      enforce: 'post',
      async generateBundle(_, bundle) {
        const chunk = bundle[outputFileName()];
        if (chunk?.type === 'chunk') chunk.code = await minifyUserscript(chunk.code);
      },
    },
  ],
  build: {
    minify: 'oxc',
    cssMinify: true,
  },
  server: {
    port: 53173,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['vite-plugin-monkey/dist/client'],
  },
});

import { readFileSync } from 'node:fs';

const js = readFileSync('dist/inex.ge-tweaks.user.js', 'utf8');
const css = readFileSync('dist/dark.user.css', 'utf8');
const userscriptUrl =
  'https://github.com/Mayurifag/inex.ge-tweaks/raw/refs/heads/dist/inex.ge-tweaks.user.js';
const userstyleUrl =
  'https://github.com/Mayurifag/inex.ge-tweaks/raw/refs/heads/dist/dark.user.css';

const checks = [
  [/^\/\/ @name\s+inex\.ge tweaks$/m.test(js), 'userscript name is missing from build'],
  [/^\/\/ @match\s+https:\/\/inex\.ge\/\*$/m.test(js), 'inex.ge match rule is missing from build'],
  [js.includes(`// @updateURL    ${userscriptUrl}`), 'userscript update URL is missing from build'],
  [
    js.includes(`// @downloadURL  ${userscriptUrl}`),
    'userscript download URL is missing from build',
  ],
  [js.includes('--inex-bg'), 'dark CSS is missing from build'],
  [!js.includes('==UserStyle=='), 'userstyle metadata leaked into userscript build'],
  [/==UserStyle==/.test(css), 'userstyle metadata is missing from CSS build'],
  [
    css.includes(`@updateURL      ${userstyleUrl}`),
    'userstyle update URL is missing from CSS build',
  ],
];

for (const [ok, message] of checks) {
  if (ok) continue;
  console.error(message);
  process.exitCode = 1;
}

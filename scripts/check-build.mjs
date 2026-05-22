import { readFileSync } from 'node:fs';

const js = readFileSync('dist/inex.ge-tweaks.user.js', 'utf8');
const userscriptUrl =
  'https://raw.githubusercontent.com/Mayurifag/inex.ge-tweaks/dist/inex.ge-tweaks.user.js';

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
];

for (const [ok, message] of checks) {
  if (ok) continue;
  console.error(message);
  process.exitCode = 1;
}

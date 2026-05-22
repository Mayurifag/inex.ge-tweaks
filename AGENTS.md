# AGENTS.md

Fresh `inex.ge` userscript after the site redesign. Old parcel-page DOM logic was intentionally not copied.

## WORKFLOW

- Start with `npm run dev`; install the dev userscript from `http://127.0.0.1:<port>/__vite-plugin-monkey.install.user.js`.
- Use Chrome MCP with the user's Helium browser/profile for website inspection and login testing.
- Run relevant checks before stopping: `npm run lint`, `npm run stylelint`, `npm run format`, `npm test`, `npm run build`, `npm run smoke:build`.

## STRUCTURE

- `src/dark.user.css` is dual-use: imported into the userscript and usable separately as a Stylus/UserCSS file.
- Keep `src/dark.user.css` ordered as metadata, tokens in `:root`, base rules, component rules, route-specific rules.
- Only use `--inex-*` variables for repeated dark-theme colors; add variables to `:root` before use.
- Keep UserCSS stripping/minification outside `vite.config.mjs`; current helper is `scripts/userstyle-css.mjs`.
- `secrets.txt` is git-crypt encrypted and uses `email=...` / `password=...`.

## NOTES

- Do not reintroduce old site selectors/features unless verified against the redesigned site.
- Do not add Playwright MCP artifacts or Markdown automation config from the old repo.

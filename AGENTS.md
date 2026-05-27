# AGENTS.md

- Fresh `inex.ge` userscript; old site DOM logic was intentionally not copied.
- Dev install: `npm run dev` → `http://127.0.0.1:<port>/__vite-plugin-monkey.install.user.js`.
- Browser testing: project `opencode.json` uses `agent-browser` MCP with Helium and project-local `browser-data/`; stop if it opens Chrome/Incognito/Guest.
- Browser audits must keep the normal Helium profile extensions enabled; do not use `--disable-extensions`. If launching manually, use background/no-focus launch such as `open -g`.
- Start OpenCode from this repo so project `opencode.json` disables the global Chrome DevTools MCP.
- `src/dark.user.css` is dual-use Userscript + Stylus/UserCSS; keep order: metadata, `:root` tokens, base, components, route-specific.
- Use `--inex-*` vars for repeated dark colors; define in `:root` first.
- Keep UserCSS stripping outside `vite.config.mjs`; helper is `scripts/userstyle-css.mjs`.
- Keep `optimizeDeps.exclude: ['vite-plugin-monkey/dist/client']`; dev install can break if Vite prebundles the monkey client.
- `secrets.txt` is git-crypt encrypted and uses `email=...` / `password=...`.
- Do not add Playwright MCP artifacts or old selectors/features unless verified against the redesigned site.
- Use GitHub `/raw/refs/heads/dist/` URLs for public userscript/UserCSS install and update URLs; `raw.githubusercontent.com` caching can delay update detection.

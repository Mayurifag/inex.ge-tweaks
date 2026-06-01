# AGENTS.md

- Do not diagnose userscript GM APIs by page-context `import('/src/main.js')`; that bypasses the userscript sandbox and falsely reports `GM_addStyle is not a function`. Verify installed script via actual page effects, console, and loaded `__vite-plugin-monkey.entry.js`.
- `src/dark.user.css` is dual-use Userscript + Stylus/UserCSS; keep order: metadata, `:root` tokens, base, components, route-specific.
- Use `--inex-*` vars for repeated dark colors; define in `:root` first.
- Keep UserCSS stripping outside `vite.config.mjs`; helper is `scripts/userstyle-css.mjs`.
- Keep `optimizeDeps.exclude: ['vite-plugin-monkey/dist/client']`; dev install can break if Vite prebundles the monkey client.
- `secrets.txt` is git-crypt encrypted and uses `email=...` / `password=...`. Use it for login.
- For browser declaration testing, log in on the same tab where the local Vite userscript is injected; different tabs can have different injection/auth state. After login, verify `__vite-plugin-monkey.entry.js` and a real page effect before opening declarations.

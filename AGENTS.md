# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Datalund marketing website**: a static site built with **Vite 8 + TypeScript** (no framework, no backend, no database). `src/main.ts` renders the landing page into `#app`; the AppSource legal pages under `public/` (`/visuals/gantt/`, `/support/`, `/privacy/`) are static HTML copied on build.

Dependencies are installed by the startup update script (`npm install`), so you normally don't need to install anything.

Commands (see `package.json`):
- `npm run dev` — Vite dev server on http://localhost:5173/ (hot reload).
- `npm run build` — runs `tsc` (type-check) then `vite build` into `dist/`. There is **no separate lint/test suite**; `tsc` via the build is the type/lint gate. `tsconfig.json` enables strict checks (`noUnusedLocals`, `noUnusedParameters`), so unused code fails the build.
- `npm run preview` — serve the production `dist/` build.

Notes:
- Dev-server routing caveat: in `npm run dev`, the static legal pages resolve via their explicit file path (e.g. `http://localhost:5173/support/index.html`). A bare directory URL like `/support/` falls back to the SPA landing page. In the production build and on GitHub Pages the directory URL (`/support/`) works normally, so this is a dev-only quirk — not a bug to fix.
- Deployment is automatic via GitHub Pages (`.github/workflows/deploy-pages.yml`) on push to `main`; no manual deploy needed.
- `public/CNAME` pins the custom domain `datalund.no`; `vite.config.ts` uses `base: '/'`. Don't change these unless the hosting/domain setup changes.

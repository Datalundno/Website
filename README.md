# Datalund website

Marketing site for [Datalund](https://datalund.no) — free Power BI visuals.

**Repo:** [Datalundno/Website](https://github.com/Datalundno/Website)  
**Pages:** https://datalundno.github.io/Website/  
**Custom domain:** [datalund.no](https://datalund.no)

## AppSource legal pages (copied from `public/` on build)

| URL | File |
| --- | --- |
| `/demo/` | Interactive Gantt preview (website mock, not Power BI) |
| `/visuals/gantt/` | Help / product |
| `/support/` | Support (must differ from Help) |
| `/privacy/` | Privacy policy |

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Hosted on **GitHub Pages** via `.github/workflows/deploy-pages.yml` (builds on push to `main`).

Domain + DNS: [DOMAIN.md](./DOMAIN.md).

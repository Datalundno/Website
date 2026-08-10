# Domains — datalund.no / datalund.online

**Status:** Registered at Domeneshop (navnetjenere `ns1/ns2/ns3.hyp.net`).  
**GitHub org:** [Datalundno](https://github.com/Datalundno) (renamed from Chartvik)  
**Repo:** https://github.com/Datalundno/Website  
Hosting: **GitHub Pages** (Actions build at repo root).

Temporary Pages URL (before / without custom domain): https://datalundno.github.io/Website/

## DNS hos Domeneshop

Slå av **WWW-videresending** når DNS er satt (ellers kan den konflikte).

### Apex — `datalund.no`

Fire `A`-pekere til GitHub Pages:

| Type | Vert | Verdi |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

### www — `www.datalund.no`

| Type | Vert | Verdi |
| --- | --- | --- |
| CNAME | `www` | `datalundno.github.io` |

> After the org rename, the Pages host is **`datalundno.github.io`** (not `chartvik.github.io`). Update DNS if you still have the old CNAME.

### Google Search Console — domain verification

Google **Domain** property for `datalund.no` requires a DNS **TXT** record (HTML meta tags cannot verify a Domain property).

Add this at Domeneshop ([login](https://domeneshop.no/login)):

| Type | Vertsnavn | Verdi |
| --- | --- | --- |
| TXT | *(leave empty / `@`)* | `google-site-verification=151pJ3qg6luhPTKhh2yrdRitV5cEjNE8_gt0pPwixuE` |

Steps:

1. **Mine domener** → **datalund.no** → **DNS-pekere**
2. Click **Vis avanserte innstillinger** (needed for TXT)
3. Bottom row: Type **TXT**, Vertsnavn empty, paste the value above, green **+**
4. Wait for DNS (often minutes; can take up to 24–48h)
5. In Search Console, press **Verify**

Check propagation:

```bash
dig TXT datalund.no +short
```

You should see a line containing `google-site-verification=151pJ3qg6luhPTKhh2yrdRitV5cEjNE8_gt0pPwixuE`.

Keep the TXT record after verification (Google may re-check).

### E-post — `support@datalund.no`

The site lists **support@datalund.no**. There is no public personal address.

Set this up at Domeneshop (**Mine domener → datalund.no → Epost**), not in the GitHub Pages DNS A/CNAME list:

1. Open the **Epost** tab for `datalund.no`.
2. Create an address (or alias) **`support`**.
3. Prefer **videresending** to your private inbox (e.g. Gmail) so you receive mail without publishing that address.
4. Let Domeneshop manage **MX** (and SPF if they offer it). Do not point MX at GitHub.
5. Send a test to `support@datalund.no` and confirm it arrives.

Optional: add `hello@` or catch-all forwarding the same way.

### Valgfritt — `datalund.online`

Samme A/CNAME-oppsett, eller en videresending til `https://datalund.no`.

## GitHub Pages (Datalundno/Website)

1. Repo → **Settings → Pages**: Source = **GitHub Actions**.
2. Custom domain = `datalund.no` (the `public/CNAME` file ships in the build).
3. Enable **Enforce HTTPS** when DNS is green.
4. Confirm these AppSource URLs resolve:
   - https://datalund.no/visuals/gantt/
   - https://datalund.no/visuals/resource-load/
   - https://datalund.no/visuals/task-list/
   - https://datalund.no/support/
   - https://datalund.no/privacy/
   - https://datalund.no/downloads/ganttChart.pbiviz
   - https://datalund.no/downloads/resourceLoad.pbiviz
   - https://datalund.no/downloads/taskList.pbiviz
   - https://datalund.no/downloads/DataLundSuite.zip
   - https://datalund.no/downloads/DatalundSuiteSample.xlsx

## Sample data

Shared suite workbook + per-visual extracts are generated from one script:

```bash
python3 scripts/generate-sample-data.py
```

| File | Use |
| --- | --- |
| `public/downloads/DatalundSuiteSample.xlsx` | Branded starter — **Start here** + Projects + Tasks (Task List filters Gantt / Resource Load) |
| `public/downloads/GanttSampleData.xlsx` | Gantt-only starter |
| `public/downloads/ResourceLoadSampleData.xlsx` | Resource Load-only starter |
| `public/downloads/TaskListSampleData.xlsx` | Task List-only starter |

Each workbook opens on a branded **Start here** sheet (quick start + bind minimums), then a styled data sheet with filters, frozen headers, and RAG coloring. Keep the column headers when you replace sample rows with your own data.

Edit `scripts/generate-sample-data.py`, re-run, then commit the four `.xlsx` files together so they do not drift.

### Shared suite field columns

Starter Excels only include columns PMs keep up to date:

| Column | Suite role | Notes |
| --- | --- | --- |
| Task / Project | `task` | Task List display: **Project** |
| Start Date | `startDate` | |
| End Date | `endDate` | Prefer End Date in starters |
| Progress | `progress` | **0–100** in samples (visuals also accept 0–1) |
| Group | `group` | Phase / parent |
| Resource / Project lead | `resource` | Task List display: **Project lead** |
| RAG | `status` | Optional suite role (Task List uses it today) |

**Not in starters** (visuals still support them): Duration, Tooltips. Add those later if needed — do not put unused columns in the starter model.

## Lokal build

```bash
npm install && npm run build
```

Output: `dist`.

## Analytics (Google Analytics 4)

Visit and download counts use **Google Analytics 4**, loaded only after visitor opt-in.
No other third-party trackers (Plausible/Matomo/etc.) are used.

Measurement ID in use: **`G-E74PBCR7V3`** (`public/js/consent-analytics.js`).

1. In GA4 → **Admin → Data collection / Data retention**, disable Google signals / ads features you do not need, and set retention as short as practical.
2. Confirm events: page views plus `download` (with `file_name`) after a consented test click on the live site.
3. To rotate the ID later, update `GA_MEASUREMENT_ID` in `public/js/consent-analytics.js` and redeploy.

Consent UI + script: `public/js/consent-analytics.js`. Privacy copy: `/privacy/#analytics`.

## Private unbranded downloads (not linked on the site)

Personal white-label builds — different GUID / no DataLund branding. Same behaviour as the branded visuals.

### Gantt Chart

| | |
| --- | --- |
| URL | https://datalund.no/downloads/wl/GanttChart.pbiviz |
| File | `public/downloads/wl/GanttChart.pbiviz` |
| Upstream | https://github.com/Datalundno/GANTT/releases/download/whitelabel-1.8.1.0/GanttChart.pbiviz |
| Display name | Gantt Chart |
| Version | 1.8.1.0 |

### Resource Load

| | |
| --- | --- |
| URL | https://datalund.no/downloads/wl/ResourceLoad.pbiviz |
| File | `public/downloads/wl/ResourceLoad.pbiviz` |
| Upstream | https://github.com/Datalundno/Resource-Load/raw/main/downloads/wl/ResourceLoad.pbiviz |
| Display name | Resource Load |
| Version | 1.0.0.0 (ecosystem Color by) |

### Task List

| | |
| --- | --- |
| URL | https://datalund.no/downloads/wl/TaskList.pbiviz |
| File | `public/downloads/wl/TaskList.pbiviz` |
| Upstream | https://github.com/Datalundno/Task-List/raw/main/taskList/downloads/wl/TaskList.pbiviz |
| Display name | Task List |
| Version | 1.0.3.0 |

Not linked from home/help/nav/sitemap. `robots.txt` disallows `/downloads/wl/`. Do not advertise these URLs publicly.

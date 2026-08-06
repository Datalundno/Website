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
   - https://datalund.no/support/
   - https://datalund.no/privacy/

## Lokal build

```bash
npm install && npm run build
```

Output: `dist`.

## Analytics (Plausible)

Visit and download counts use **Plausible** (cookieless), loaded only after visitor opt-in.

1. Create a site for `datalund.no` at [plausible.io](https://plausible.io) (EU company; or self-host).
2. Add a custom event / goal named **`Download`** (props include `file`).
3. No code change needed — the site already loads `script.tagged-events.js` for `datalund.no` after consent.
4. Optional: enable Plausible’s email reports for weekly visit/download summaries.

Consent UI + script: `public/js/consent-analytics.js`. Privacy copy: `/privacy/#analytics`.

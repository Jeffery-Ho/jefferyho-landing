# jefferyho-landing

The v2 homepage for jefferyho.com, served at https://jefferyho.com/v2/ (English: `/v2/en/`).

## How the domain is split

| Route | Worker | Serves |
| --- | --- | --- |
| `jefferyho.com/*`, `www.jefferyho.com/*` | `notion2` (not in this repo) | The Notion site, proxied from `jefferyho.notion.site`, including `/`, `/sitemap.xml`, `/robots.txt` |
| `jefferyho.com/v2*`, `www.jefferyho.com/v2*` | `jefferyho-landing` (this repo) | The v2 pages and their files; `www` 301-redirects to `jefferyho.com` |

Cloudflare matches the more specific `/v2*` routes first. This repo must not change anything outside `/v2`:
every file it serves lives under `public/v2/`, and `wrangler.jsonc` only declares the `/v2*` routes.

`wrangler deploy` removes routes that point to this Worker but are not in `wrangler.jsonc`.
Never add the catch-all routes here, and list the zone's routes after each deploy.

## Layout

| Path | Purpose |
| --- | --- |
| `scripts/build.mjs` | Content source; generates `public/v2/index.html`, `public/v2/en/index.html`, `public/v2/sitemap.xml` |
| `scripts/og.swift` | Renders `public/v2/og.png`, `og-en.png`, `apple-touch-icon.png`, `favicon.png` from `avatar.png` (macOS) |
| `public/v2/` | Static files served by the Worker |
| `src/index.ts` | Worker: www redirect, then static assets |
| `wrangler.jsonc` | Worker config and `/v2*` routes |

## Workflow

```bash
npm install
npm run build   # after editing content in scripts/build.mjs
npm run og      # after changing share image copy
npm run dev     # local preview at http://localhost:8787/v2/
npm run deploy  # needs `npx wrangler login` with the account that owns the jefferyho.com zone
```

After deploying, check `https://jefferyho.com/v2/`, `/v2/en/`, `https://www.jefferyho.com/v2/` (301),
and that `https://jefferyho.com/` still lands on the Notion homepage.

Submit `https://jefferyho.com/v2/sitemap.xml` in Google Search Console / Bing Webmaster Tools
(the root `/sitemap.xml` belongs to `notion2`).

Rollback: delete the two `/v2*` routes (or `npx wrangler delete`); the Notion site is unaffected.

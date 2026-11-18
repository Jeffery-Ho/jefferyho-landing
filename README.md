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
| `content/pages.mjs` | Every migrated page: Notion ID, section, slug, titles, summary, project facts, cover |
| `content/notion/<id>.json` | Page bodies pulled from Notion (simplified block tree) |
| `scripts/notion-sync.mjs` | Pulls pages and images from the public Notion site into `content/notion/` and `public/v2/media/` |
| `scripts/render-notion.mjs` | Renders the block tree to HTML |
| `scripts/build.mjs` | Generates the home pages, one page per entry, and `public/v2/sitemap.xml` |
| `scripts/og.swift` | Renders `public/v2/og.png`, `og-en.png`, `apple-touch-icon.png`, `favicon.png` from `avatar.png` (macOS) |
| `public/v2/` | Static files served by the Worker (`covers/`, `media/`, `assets/`, pages) |
| `archive/notion-media/` | Original Notion images, kept for reference; not deployed |
| `src/index.ts` | Worker: www redirect, then static assets |
| `wrangler.jsonc` | Worker config and `/v2*` routes |

Page URLs: `/v2/projects/<slug>/`, `/v2/projects/rereading-hig/<chapter>/`, `/v2/writing/<slug>/`,
`/v2/photography/<slug>/`, `/v2/about/<slug>/`. Weekly 22/23/24/26 are chapters of Revisiting HIG and
link to those chapter pages.

## Workflow

```bash
npm install
npm run sync    # re-pull Notion content and images (all pages, or: npm run sync -- <slug> ...)
npm run build   # regenerate pages and sitemap
npm run og      # after changing share image copy
npm run dev     # local preview at http://localhost:8787/v2/
npm run deploy  # needs `npx wrangler login` with the account that owns the jefferyho.com zone
```

To add a page: add an entry to `content/pages.mjs`, then `npm run sync -- <slug>` and `npm run build`.

After deploying, check `https://jefferyho.com/v2/`, `/v2/en/`, `https://www.jefferyho.com/v2/` (301),
and that `https://jefferyho.com/` still lands on the Notion homepage.

Submit `https://jefferyho.com/v2/sitemap.xml` in Google Search Console / Bing Webmaster Tools
(the root `/sitemap.xml` belongs to `notion2`).

Rollback: delete the two `/v2*` routes (or `npx wrangler delete`); the Notion site is unaffected.

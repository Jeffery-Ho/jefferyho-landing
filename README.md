# jefferyho-landing

Homepage and site metadata for https://jefferyho.com.

- `main`: the site is served entirely by Notion, through the existing `notion2` Worker
  (proxies `jefferyho.notion.site` onto `jefferyho.com`).
- `v2`: the `jefferyho-landing` Worker owns the zone routes. It serves the new homepage at `/v2/` (`/v2/en/` in English)
  and metadata files (`/sitemap.xml`, `/robots.txt`, `/og.png`, icons) from static assets and hands
  every other path to `notion2` through a service binding, so `/` (the Notion homepage) and existing Notion page URLs keep working.
  `www.jefferyho.com` 301-redirects to `jefferyho.com`.

## Layout

| Path | Purpose |
| --- | --- |
| `scripts/build.mjs` | Content source; generates `public/v2/index.html`, `public/v2/en/index.html`, `public/sitemap.xml` |
| `scripts/og.swift` | Renders `public/og.png`, `public/og-en.png`, `public/apple-touch-icon.png` (macOS) |
| `public/` | Static assets served by the Worker |
| `src/index.ts` | Worker: www redirect, assets first, Notion fallback |
| `wrangler.jsonc` | Worker config and routes |

## Workflow

```bash
npm install
npm run build   # after editing content in scripts/build.mjs
npm run og      # after changing share image copy
npm run dev     # local preview at http://localhost:8787
```

## Deploy

1. `npx wrangler login` with the Cloudflare account that owns the `jefferyho.com` zone.
2. `npm run deploy` — attaches the Worker to `jefferyho.com/*` and `www.jefferyho.com/*`.
3. Check `https://jefferyho.com/v2/`, `/v2/en/`, `/` (Notion), a Notion page URL, and `https://www.jefferyho.com/` (should 301).
4. Turn off Cloudflare "Managed robots.txt" for the zone if it still prepends content to `/robots.txt`.
5. Submit `https://jefferyho.com/sitemap.xml` in Google Search Console / Bing Webmaster Tools.

Rollback: in the Cloudflare dashboard (Workers Routes for the `jefferyho.com` zone), point
`jefferyho.com/*` and `www.jefferyho.com/*` back to `notion2`. Do not delete `notion2`; this Worker
depends on it.

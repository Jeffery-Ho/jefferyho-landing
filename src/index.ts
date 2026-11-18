interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: Fetcher;
  // Existing "notion2" Worker that proxies jefferyho.notion.site onto this domain.
  NOTION: Fetcher;
}

const CANONICAL_HOST = "jefferyho.com";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Canonical domain: www -> apex, same path and query.
    if (url.hostname === `www.${CANONICAL_HOST}`) {
      url.hostname = CANONICAL_HOST;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    // v2 owns the homepage and site metadata files.
    if (request.method === "GET" || request.method === "HEAD") {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }

    // Everything else stays on Notion, via the existing notion2 proxy Worker.
    return env.NOTION.fetch(request);
  },
};

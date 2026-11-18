// Serves only https://jefferyho.com/v2* — every other path stays on the Notion site (notion2 Worker).
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const CANONICAL_HOST = "jefferyho.com";

// HTML keeps the default (always revalidate) so edits show up immediately.
function cachePolicy(url: URL): string | null {
  // site.css / site.js are referenced with a content-hash ?v= by the build.
  if (url.pathname.startsWith("/v2/assets/") && url.searchParams.has("v")) {
    return "public, max-age=31536000, immutable";
  }
  if (/\.(jpe?g|png|gif|webp|svg)$/i.test(url.pathname)) {
    return "public, max-age=604800, stale-while-revalidate=86400";
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Canonical domain: www -> apex, same path and query.
    if (url.hostname === `www.${CANONICAL_HOST}`) {
      url.hostname = CANONICAL_HOST;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    const response = await env.ASSETS.fetch(request);
    const cacheControl = cachePolicy(url);
    if (!cacheControl || !response.ok) return response;
    const cached = new Response(response.body, response);
    cached.headers.set("Cache-Control", cacheControl);
    return cached;
  },
};

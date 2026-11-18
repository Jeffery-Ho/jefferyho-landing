// Serves only https://jefferyho.com/v2* — every other path stays on the Notion site (notion2 Worker).
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
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

    return env.ASSETS.fetch(request);
  },
};

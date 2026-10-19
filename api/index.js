const app = require("../backend/app");

/**
 * Vercel invokes this file as the Node.js function for `/api`.
 * `api/[...slug].js` reuses the same handler for `/api/*`.
 *
 * Filesystem routes win over rewrites, so Express sees the real path
 * when Vercel passes it through. If a rewrite ever leaves only `/` plus
 * a `slug` query, put the `/api` prefix back before Express routes.
 */
function normalizeRequestUrl(req) {
  const raw = req.url || "/";
  const qIndex = raw.indexOf("?");
  const pathOnly = qIndex === -1 ? raw : raw.slice(0, qIndex);
  const query = qIndex === -1 ? "" : raw.slice(qIndex);

  if (pathOnly === "/api" || pathOnly.startsWith("/api/")) {
    return raw;
  }

  const slug = req.query && req.query.slug;
  const parts = Array.isArray(slug) ? slug : slug ? [slug] : [];

  if (pathOnly === "/" || pathOnly === "") {
    if (parts.length === 0) return `/api${query}`;
    return `/api/${parts.join("/")}${query}`;
  }

  const suffix = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return `/api${suffix}${query}`;
}

function handler(req, res) {
  req.url = normalizeRequestUrl(req);
  return app(req, res);
}

handler.app = app;
handler.normalizeRequestUrl = normalizeRequestUrl;

module.exports = handler;

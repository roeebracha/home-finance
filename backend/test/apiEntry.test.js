const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../app");
const entry = require("../../api/index");
const slug = require("../../api/[...slug]");

describe("vercel entry", () => {
  it("exports one handler shared by /api and /api/*", () => {
    assert.equal(typeof entry, "function");
    assert.equal(entry.app, app);
    assert.equal(slug, entry);
  });

  it("keeps an /api path and restores one that a rewrite stripped", () => {
    const { normalizeRequestUrl } = entry;
    assert.equal(normalizeRequestUrl({ url: "/api/auth/me" }), "/api/auth/me");
    assert.equal(
      normalizeRequestUrl({ url: "/api/health?x=1" }),
      "/api/health?x=1",
    );
    assert.equal(
      normalizeRequestUrl({ url: "/", query: { slug: ["auth", "me"] } }),
      "/api/auth/me",
    );
    assert.equal(normalizeRequestUrl({ url: "/auth/me" }), "/api/auth/me");
    assert.equal(normalizeRequestUrl({ url: "/" }), "/api");
  });
});

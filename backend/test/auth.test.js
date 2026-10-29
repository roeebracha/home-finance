process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1h";
process.env.ALLOWED_EMAILS = "roee@example.com, aviv@example.com";
process.env.GOOGLE_CLIENT_ID = "test-client";

const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const googleAuth = require("../services/googleAuth");
const { signToken } = require("../services/tokenService");
const { isAllowedEmail, allowedEmails } = require("../services/allowlist");

googleAuth.verifyGoogleCredential = async (credential) => {
  if (credential === "allowed") {
    return {
      googleId: "gid-roee",
      email: "Roee@Example.com",
      name: "רועי ברכה",
      picture: "https://example.com/r.png",
    };
  }
  if (credential === "stranger") {
    return {
      googleId: "gid-x",
      email: "stranger@example.com",
      name: "Stranger",
      picture: "",
    };
  }
  throw new Error("bad credential");
};

const app = require("../app");

describe("allowlist", () => {
  it("parses comma-separated emails without case or surrounding space", () => {
    assert.deepEqual(allowedEmails(), ["roee@example.com", "aviv@example.com"]);
    assert.equal(isAllowedEmail(" Roee@Example.com "), true);
    assert.equal(isAllowedEmail("aviv@example.com"), true);
    assert.equal(isAllowedEmail("other@example.com"), false);
    assert.equal(isAllowedEmail(""), false);
  });

  it("fails closed when ALLOWED_EMAILS is empty", () => {
    const previous = process.env.ALLOWED_EMAILS;
    process.env.ALLOWED_EMAILS = "  ,  ";
    assert.equal(isAllowedEmail("roee@example.com"), false);
    process.env.ALLOWED_EMAILS = previous;
  });
});

describe("auth routes", () => {
  let allowedToken;

  before(() => {
    allowedToken = signToken({
      googleId: "gid-roee",
      email: "Roee@Example.com",
      name: "רועי ברכה",
      picture: "",
    });
  });

  it("GET /api/health", async () => {
    const response = await request(app).get("/api/health");
    assert.equal(response.status, 200);
    assert.equal(response.body.ok, true);
  });

  it("rejects /me without a token", async () => {
    const response = await request(app).get("/api/auth/me");
    assert.equal(response.status, 401);
    assert.equal(response.body.error, "missing_token");
  });

  it("rejects a bad token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-token");
    assert.equal(response.status, 401);
    assert.equal(response.body.error, "invalid_token");
  });

  it("rejects an allowlisted-looking token after the email is removed", async () => {
    const token = signToken({
      googleId: "gid-x",
      email: "stranger@example.com",
      name: "Stranger",
    });
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(response.status, 403);
    assert.equal(response.body.error, "email_not_allowed");
  });

  it("returns the user for an allowlisted token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${allowedToken}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.user.email, "roee@example.com");
    assert.equal(response.body.user.name, "רועי ברכה");
    assert.equal(response.body.user.id, "gid-roee");
  });

  it("requires a Google credential", async () => {
    const response = await request(app).post("/api/auth/google").send({});
    assert.equal(response.status, 400);
    assert.equal(response.body.error, "missing_credential");
  });

  it("rejects a credential Google would not verify", async () => {
    const response = await request(app)
      .post("/api/auth/google")
      .send({ credential: "nope" });
    assert.equal(response.status, 401);
    assert.equal(response.body.error, "invalid_credential");
  });

  it("rejects a verified Google account that is not on the list", async () => {
    const response = await request(app)
      .post("/api/auth/google")
      .send({ credential: "stranger" });
    assert.equal(response.status, 403);
    assert.equal(response.body.error, "email_not_allowed");
  });

  it("fails closed when ALLOWED_EMAILS is missing and does not issue a token", async () => {
    const previous = process.env.ALLOWED_EMAILS;
    delete process.env.ALLOWED_EMAILS;
    try {
      const response = await request(app).post("/api/auth/google").send({ credential: "allowed" });
      assert.equal(response.status, 500);
      assert.equal(response.body.error, "server_misconfigured");
      assert.equal(response.body.token, undefined);
    } finally {
      process.env.ALLOWED_EMAILS = previous;
    }
  });

  it("fails closed when JWT_SECRET is missing and does not issue a token", async () => {
    const previous = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    try {
      const response = await request(app).post("/api/auth/google").send({ credential: "allowed" });
      assert.equal(response.status, 500);
      assert.equal(response.body.error, "server_misconfigured");
      assert.equal(response.body.token, undefined);
    } finally {
      process.env.JWT_SECRET = previous;
    }
  });

  it("issues our JWT for an allowlisted Google account", async () => {
    const response = await request(app)
      .post("/api/auth/google")
      .send({ credential: "allowed" });
    assert.equal(response.status, 200);
    assert.equal(response.body.user.email, "roee@example.com");
    assert.equal(typeof response.body.token, "string");

    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${response.body.token}`);
    assert.equal(me.status, 200);
    assert.equal(me.body.user.name, "רועי ברכה");
  });
});

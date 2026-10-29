process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.ALLOWED_EMAILS = process.env.ALLOWED_EMAILS || "roee@example.com, aviv@example.com";
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "test-client";

const { describe, it, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../app");
const sheets = require("../services/sheets");
const { signToken } = require("../services/tokenService");

const original = sheets.readHousehold;

describe("GET /api/household", () => {
  after(() => {
    sheets.readHousehold = original;
  });

  it("requires a token", async () => {
    const response = await request(app).get("/api/household");
    assert.equal(response.status, 401);
    assert.equal(response.body.error, "missing_token");
  });

  it("returns the composed picture for an allowlisted session", async () => {
    sheets.readHousehold = async () => ({
      updatedAt: "2026-10-29T12:00:00.000Z",
      balanceAgorot: -217403,
      sheetBalanceAgorot: -217403,
      pendingCount: 0,
      settings: [],
      transactions: [],
      receipts: [],
      spendAgorot: 0,
    });
    const token = signToken({
      googleId: "gid-roee",
      email: "roee@example.com",
      name: "רועי",
      picture: "",
    });
    const response = await request(app)
      .get("/api/household")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.balanceAgorot, -217403);
    assert.equal(response.body.updatedAt, "2026-10-29T12:00:00.000Z");
  });

  it("surfaces a schema failure in Hebrew and does not invent a balance", async () => {
    sheets.readHousehold = async () => {
      const error = new Error("balance_final חסר. אין מאזן להציג.");
      error.code = "SHEET_INVALID";
      throw error;
    };
    const token = signToken({
      googleId: "gid-roee",
      email: "roee@example.com",
      name: "רועי",
      picture: "",
    });
    const response = await request(app)
      .get("/api/household")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(response.status, 502);
    assert.equal(response.body.error, "sheet_invalid");
    assert.match(response.body.message, /אין מאזן/);
    assert.equal(response.body.balanceAgorot, undefined);
  });
});

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { readHousehold, assertRowId, assertAgorot } = require("../services/sheets");

describe("sheets stub", () => {
  it("refuses to invent household numbers before the sheet is connected", async () => {
    await assert.rejects(readHousehold(), (error) => {
      assert.equal(error.code, "SHEETS_NOT_CONFIGURED");
      assert.match(error.message, /לא מחובר/);
      return true;
    });
  });

  it("accepts stable row ids and rejects anything else", () => {
    assert.equal(assertRowId("mv-rent"), "mv-rent");
    assert.equal(assertRowId("hm-1"), "hm-1");
    assert.equal(assertRowId("rc-coffee_2"), "rc-coffee_2");
    assert.equal(assertRowId("sp-42"), "sp-42");
    assert.throws(() => assertRowId("row-1"), /מזהה שורה לא תקין/);
    assert.throws(() => assertRowId("mv-"), /מזהה שורה לא תקין/);
  });

  it("accepts only integer agorot", () => {
    assert.equal(assertAgorot(216857), 216857);
    assert.equal(assertAgorot(-50), -50);
    assert.equal(assertAgorot(0), 0);
    assert.throws(() => assertAgorot(10.5), /סכום לא תקין/);
    assert.throws(() => assertAgorot("216857"), /סכום לא תקין/);
  });
});

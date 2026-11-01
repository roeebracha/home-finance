const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  readHousehold,
  composeHousehold,
  assertRowId,
  assertAgorot,
} = require("../services/sheets");
const { TRANSACTIONS_HEADER, SETTINGS_HEADER, ACTIONS_HEADER } = require("../services/sheetParse");

describe("sheets connection", () => {
  it("refuses to invent household numbers when the sheet is not configured", async () => {
    const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const id = process.env.GOOGLE_SHEET_ID;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    delete process.env.GOOGLE_SHEET_ID;
    try {
      await assert.rejects(readHousehold(), (error) => {
        assert.equal(error.code, "SHEETS_NOT_CONFIGURED");
        assert.match(error.message, /לא מוגדר/);
        return true;
      });
    } finally {
      if (json === undefined) delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      else process.env.GOOGLE_SERVICE_ACCOUNT_JSON = json;
      if (id === undefined) delete process.env.GOOGLE_SHEET_ID;
      else process.env.GOOGLE_SHEET_ID = id;
    }
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

describe("composeHousehold", () => {
  it("overlays only pending actions and groups the victory receipt", () => {
    const picture = composeHousehold({
      transactions: [
        TRANSACTIONS_HEADER,
        [46313, "סופר", "ויקטורי", "מזון", 21.81, "רועי", "משותף", 10.905, 10.905, "כרטיס", "sp-2026-10-18-victory"],
        [46313, "סופר", "ויקטורי", "מזון", 145, "אביב", "משותף", 72.5, 72.5, "סיבוס", "sp-2026-10-18-victory-cibus"],
      ],
      settings: [SETTINGS_HEADER, ["monthly_budget", "", "אנג׳לה", "2026-10-19"]],
      actions: [
        ACTIONS_HEADER,
        [
          "",
          "רועי",
          "עדכון",
          "sp-2026-10-18-victory",
          JSON.stringify({ הערות: "עודכן מהאתר" }),
          "מוזגה",
          "act-merged",
        ],
        [
          "",
          "רועי",
          "עדכון",
          "sp-2026-10-18-victory",
          JSON.stringify({ הערות: "ממתין" }),
          "ממתינה",
          "act-pending",
        ],
      ],
      balance: [[-2174.03]],
    });

    assert.equal(picture.sheetBalanceAgorot, -217403);
    assert.equal(picture.pendingCount, 1);
    assert.equal(picture.transactions[0].notes, "ממתין");
    assert.equal(picture.receipts.length, 1);
    assert.equal(picture.receipts[0].id, "sp-2026-10-18-victory");
    assert.equal(picture.receipts[0].amountAgorot, 2181 + 14500);
    assert.equal(picture.spendAgorot, 2181 + 14500);
    assert.equal(picture.balanceAgorot, -217403);
    assert.equal(picture.settings[0].value, "");
  });
});

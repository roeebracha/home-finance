const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  TRANSACTIONS_HEADER,
  SETTINGS_HEADER,
  ACTIONS_HEADER,
  parseTransactions,
  parseSettings,
  parseActions,
  parseBalanceFinal,
} = require("../services/sheetParse");

function txnRow(values) {
  return [TRANSACTIONS_HEADER, values];
}

describe("transaction parsing", () => {
  it("keeps an empty date as null and stores shekels as integer agorot", () => {
    const [row] = parseTransactions(
      txnRow(["", "מעבר דירה", "השוכר הקודם", "מוצרי חשמל", 500, "רועי", "משותף", 250, 250, "מקרר", "mv-001"]),
    );
    assert.equal(row.date, null);
    assert.equal(row.amountAgorot, 50000);
    assert.equal(row.roeeShareAgorot, 25000);
    assert.equal(row.pending, false);
    assert.equal(row.id, "mv-001");
  });

  it("reads a Sheets serial date and rounds binary shekel noise to agorot", () => {
    const [row] = parseTransactions(
      txnRow([
        46313,
        "סופר",
        "ויקטורי",
        "מזון",
        21.809999999999974,
        "רועי",
        "משותף",
        10.904999999999987,
        10.904999999999987,
        "",
        "sp-2026-10-18-victory",
      ]),
    );
    assert.equal(row.date, "2026-10-18");
    assert.equal(row.amountAgorot, 2181);
    assert.equal(row.roeeShareAgorot, 1091);
  });

  it("accepts a dd/mm/yyyy date string and a half-agora share", () => {
    const [row] = parseTransactions(
      txnRow([
        "18/10/2026",
        "בית משותף",
        "סופר יודה",
        "מזון",
        12.67,
        "אביב",
        "משותף",
        6.335,
        6.335,
        "",
        "hm-006",
      ]),
    );
    assert.equal(row.date, "2026-10-18");
    assert.equal(row.amountAgorot, 1267);
    assert.equal(row.roeeShareAgorot, 634);
    assert.equal(row.avivShareAgorot, 634);
  });

  it("rejects an empty amount instead of turning it into zero", () => {
    assert.throws(
      () =>
        parseTransactions(
          txnRow(["", "מעבר דירה", "חנות", "ריהוט", "", "רועי", "משותף", 0, 0, "", "mv-009"]),
        ),
      /סכום חסר/,
    );
  });

  it("rejects text in an amount cell", () => {
    assert.throws(
      () =>
        parseTransactions(
          txnRow(["", "מעבר דירה", "חנות", "ריהוט", "₪500.00", "רועי", "משותף", 250, 250, "", "mv-010"]),
        ),
      /לא לטקסט/,
    );
  });

  it("rejects a duplicate stable id", () => {
    assert.throws(
      () =>
        parseTransactions([
          TRANSACTIONS_HEADER,
          ["", "סופר", "ויקטורי", "מזון", 1, "רועי", "משותף", 0.5, 0.5, "", "sp-1"],
          ["", "סופר", "ויקטורי", "מזון", 1, "אביב", "משותף", 0.5, 0.5, "", "sp-1"],
        ]),
      /מזהה כפול/,
    );
  });

  it("rejects a header that moved", () => {
    assert.throws(() => parseTransactions([["id", "סכום"], ["mv-1", 1]]), /הכותרת בטאב תנועות/);
  });
});

describe("settings and balance_final", () => {
  it("allows an empty setting value and keeps a numeric one as text", () => {
    const settings = parseSettings([
      SETTINGS_HEADER,
      ["monthly_budget", "", "אנג׳לה", "2026-10-19"],
      ["avg_months", 3, "אנג׳לה", ""],
    ]);
    assert.deepEqual(
      settings.map((row) => [row.key, row.value, row.updatedAt]),
      [
        ["monthly_budget", "", "2026-10-19"],
        ["avg_months", "3", null],
      ],
    );
  });

  it("reads balance_final as integer agorot and refuses text or a blank", () => {
    assert.equal(parseBalanceFinal([[-2174.03]]), -217403);
    assert.equal(parseBalanceFinal([[0]]), 0);
    assert.throws(() => parseBalanceFinal([["לא מספר"]]), /אינו מספר/);
    assert.throws(() => parseBalanceFinal([[""]]), /חסר/);
    assert.throws(() => parseBalanceFinal([]), /חסר/);
  });
});

describe("actions parsing", () => {
  it("parses a pending update and a merged insert", () => {
    const actions = parseActions([
      ACTIONS_HEADER,
      ["", "", "", "", "", "", ""],
      [
        "2026-10-29T10:00:00Z",
        "רועי",
        "עדכון",
        "hm-003",
        JSON.stringify({ סכום: 10, "חלק רועי": 5, "חלק אביב": 5 }),
        "ממתינה",
        "act-1",
      ],
      ["", "אנג'לה", "הוספה", "sp-new", JSON.stringify({ מקור: "סופר" }), "מוזגה", "act-2"],
    ]);
    assert.equal(actions.length, 2);
    assert.equal(actions[0].status, "ממתינה");
    assert.equal(actions[0].value["סכום"], 10);
    assert.equal(actions[1].status, "מוזגה");
    assert.equal(actions[0].at, "2026-10-29T10:00:00Z");
  });

  it("rejects an unknown status so a merged row cannot be mistaken for pending", () => {
    assert.throws(
      () =>
        parseActions([
          ACTIONS_HEADER,
          ["", "רועי", "מחיקה", "mv-001", "", "בוטלה", "act-x"],
        ]),
      /לא תואמים את המבנה/,
    );
  });
});

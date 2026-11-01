const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { applyPendingActions } = require("../services/overlay");

function row(id, amountAgorot, extras = {}) {
  return {
    id,
    date: "2026-10-18",
    source: "סופר",
    merchant: "ויקטורי",
    category: "מזון",
    amountAgorot,
    payer: "רועי",
    scope: "משותף",
    roeeShareAgorot: Math.round(amountAgorot / 2),
    avivShareAgorot: amountAgorot - Math.round(amountAgorot / 2),
    notes: "",
    pending: false,
    ...extras,
  };
}

function action(overrides) {
  return {
    at: "2026-10-29T10:00:00Z",
    user: "רועי",
    op: "עדכון",
    targetId: "hm-003",
    value: { סכום: 10, "חלק רועי": 5, "חלק אביב": 5 },
    status: "ממתינה",
    actionId: "act-1",
    ...overrides,
  };
}

const insertValue = {
  מקור: "סופר",
  "בית עסק": "ויקטורי",
  קטגוריה: "מזון",
  סכום: 21.81,
  שילם: "רועי",
  "משותף/פרטי": "משותף",
  "חלק רועי": 10.905,
  "חלק אביב": 10.905,
  הערות: "חדש",
};

describe("pending overlay", () => {
  it("applies a pending update onto the matching row id", () => {
    const base = [row("hm-003", 750)];
    const { transactions, pendingCount } = applyPendingActions(base, [action({})]);
    assert.equal(pendingCount, 1);
    assert.equal(transactions[0].amountAgorot, 1000);
    assert.equal(transactions[0].roeeShareAgorot, 500);
    assert.equal(transactions[0].pending, true);
  });

  it("does not apply a merged action, even when the same change is also pending once", () => {
    const base = [row("hm-003", 750)];
    const merged = action({ status: "מוזגה", actionId: "act-merged" });
    const pending = action({ status: "ממתינה", actionId: "act-pending" });
    const { transactions, pendingCount } = applyPendingActions(base, [merged, pending]);
    assert.equal(pendingCount, 1);
    assert.equal(transactions.length, 1);
    assert.equal(transactions[0].amountAgorot, 1000);
  });

  it("leaves an already-merged insert in place exactly once", () => {
    const base = [row("sp-new", 2181)];
    const merged = action({
      op: "הוספה",
      status: "מוזגה",
      targetId: "sp-new",
      value: insertValue,
      actionId: "act-merged",
    });
    const { transactions, pendingCount } = applyPendingActions(base, [merged]);
    assert.equal(pendingCount, 0);
    assert.equal(transactions.length, 1);
    assert.equal(transactions[0].amountAgorot, 2181);
    assert.equal(transactions[0].pending, false);
  });

  it("inserts a pending row once when a merged copy of the same action is also present", () => {
    const pending = action({
      op: "הוספה",
      status: "ממתינה",
      targetId: "sp-new",
      value: insertValue,
      actionId: "act-pending",
    });
    const merged = { ...pending, status: "מוזגה", actionId: "act-merged" };
    const { transactions, pendingCount } = applyPendingActions([], [merged, pending]);
    assert.equal(pendingCount, 1);
    assert.equal(transactions.length, 1);
    assert.equal(transactions[0].id, "sp-new");
    assert.equal(transactions[0].amountAgorot, 2181);
    assert.equal(transactions[0].notes, "חדש");
    assert.equal(transactions[0].pending, true);
  });

  it("deletes only while the action is still pending", () => {
    const base = [row("mv-001", 50000), row("mv-002", 100)];
    const removed = applyPendingActions(base, [
      action({ op: "מחיקה", targetId: "mv-001", value: null, actionId: "act-del" }),
    ]);
    assert.deepEqual(
      removed.transactions.map((item) => item.id),
      ["mv-002"],
    );

    const kept = applyPendingActions(base, [
      action({ op: "מחיקה", status: "מוזגה", targetId: "mv-001", value: null, actionId: "act-del" }),
    ]);
    assert.deepEqual(
      kept.transactions.map((item) => item.id),
      ["mv-001", "mv-002"],
    );
  });

  it("refuses a pending insert of an id that is already in the sheet", () => {
    const base = [row("sp-new", 2181)];
    assert.throws(
      () =>
        applyPendingActions(base, [
          action({ op: "הוספה", targetId: "sp-new", value: insertValue }),
        ]),
      /שכבר קיימת/,
    );
  });
});

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  groupTransactions,
  spendAgorot,
  settlementAgorot,
  presentBalance,
} = require("../services/grouping");

function row(id, extras = {}) {
  return {
    id,
    date: "2026-10-18",
    source: "סופר",
    merchant: "ויקטורי",
    category: "מזון",
    amountAgorot: 0,
    payer: "רועי",
    scope: "משותף",
    roeeShareAgorot: 0,
    avivShareAgorot: 0,
    notes: "",
    pending: false,
    ...extras,
  };
}

const victory = row("sp-2026-10-18-victory", {
  amountAgorot: 2181,
  payer: "רועי",
  roeeShareAgorot: 1091,
  avivShareAgorot: 1090,
});

const cibus = row("sp-2026-10-18-victory-cibus", {
  amountAgorot: 14500,
  payer: "אביב",
  roeeShareAgorot: 7250,
  avivShareAgorot: 7250,
  notes: "סיבוס",
});

const later = row("sp-2026-10-28-victory", {
  date: "2026-10-28",
  amountAgorot: 11228,
  payer: "רועי",
  roeeShareAgorot: 5614,
  avivShareAgorot: 5614,
});

describe("receipt grouping", () => {
  it("groups a receipt and its payment split by the shared id prefix", () => {
    const groups = groupTransactions([victory, cibus, later]);
    assert.deepEqual(
      groups.map((group) => [group.id, group.amountAgorot, group.rows.map((item) => item.id)]),
      [
        ["sp-2026-10-18-victory", 16681, ["sp-2026-10-18-victory", "sp-2026-10-18-victory-cibus"]],
        ["sp-2026-10-28-victory", 11228, ["sp-2026-10-28-victory"]],
      ],
    );
  });

  it("does not treat mv-0010 as a child of mv-001", () => {
    const groups = groupTransactions([
      row("mv-001", { amountAgorot: 100 }),
      row("mv-0010", { amountAgorot: 200 }),
    ]);
    assert.deepEqual(
      groups.map((group) => group.id),
      ["mv-001", "mv-0010"],
    );
  });

  it("sums spend from the grouped receipts", () => {
    assert.equal(spendAgorot([victory, cibus, later]), 16681 + 11228);
  });
});

describe("balance counts every row", () => {
  it("counts both sides of a split receipt and skips rows that are not shared", () => {
    const unclassified = row("sp-loose", {
      amountAgorot: 5000,
      scope: "לא סווג",
      payer: "רועי",
      roeeShareAgorot: 5000,
    });
    const personal = row("sp-personal", {
      amountAgorot: 800,
      scope: "פרטי",
      payer: "אביב",
      roeeShareAgorot: 0,
    });
    const settlement = settlementAgorot([victory, cibus, unclassified, personal]);
    assert.equal(settlement, 2181 - (1091 + 7250));
  });

  it("keeps Angela's balance_final when nothing pending changed the rows", () => {
    const rows = [victory, cibus];
    assert.equal(presentBalance(-217403, rows, rows), -217403);
  });

  it("shifts balance_final by the agorot delta of a pending edit", () => {
    const before = [victory, cibus];
    const after = [{ ...victory, amountAgorot: 3181 }, cibus];
    assert.equal(presentBalance(-217403, before, after), -217403 + 1000);
  });
});

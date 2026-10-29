function isHyphenPrefix(shorter, longer) {
  return longer === shorter || longer.startsWith(`${shorter}-`);
}

/** Shortest id in the set that contains this id on a hyphen boundary. */
function receiptGroupId(id, ids) {
  let best = id;
  for (const other of ids) {
    if (other.length < best.length && isHyphenPrefix(other, id)) best = other;
  }
  return best;
}

function groupTransactions(transactions) {
  const ids = transactions.map((row) => row.id);
  const groups = new Map();
  for (const row of transactions) {
    const key = receiptGroupId(row.id, ids);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.entries()].map(([id, rows]) => ({
    id,
    date: rows.find((row) => row.date)?.date ?? null,
    merchant: rows[0].merchant,
    source: rows[0].source,
    category: rows[0].category,
    amountAgorot: rows.reduce((sum, row) => sum + row.amountAgorot, 0),
    rows,
  }));
}

function spendAgorot(transactions) {
  return groupTransactions(transactions).reduce((sum, group) => sum + group.amountAgorot, 0);
}

/**
 * Settlement from every shared row, including each split of one receipt.
 * Positive means Aviv owes Roee (sheet column: שילם רועי − חלק רועי).
 * פרטי and לא סווג stay out, matching the מאזן tab.
 */
function settlementAgorot(transactions) {
  let paidByRoee = 0;
  let roeeShare = 0;
  for (const row of transactions) {
    if (row.scope !== "משותף") continue;
    if (row.payer === "רועי") paidByRoee += row.amountAgorot;
    roeeShare += row.roeeShareAgorot;
  }
  return paidByRoee - roeeShare;
}

/**
 * balance_final is Angela's rounded figure. Pending edits shift it by the
 * agorot delta, so an unchanged sheet stays on her number exactly.
 */
function presentBalance(sheetBalanceAgorot, before, after) {
  return sheetBalanceAgorot + (settlementAgorot(after) - settlementAgorot(before));
}

module.exports = {
  receiptGroupId,
  groupTransactions,
  spendAgorot,
  settlementAgorot,
  presentBalance,
};

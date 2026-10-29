const { transactionSchema } = require("./sheetParse");
const { shekelsToAgorot } = require("./money");
const { sheetError } = require("./sheetError");

const PATCH_FIELDS = {
  תאריך: "date",
  מקור: "source",
  "בית עסק": "merchant",
  קטגוריה: "category",
  סכום: "amountAgorot",
  שילם: "payer",
  "משותף/פרטי": "scope",
  "חלק רועי": "roeeShareAgorot",
  "חלק אביב": "avivShareAgorot",
  הערות: "notes",
};

const MONEY_FIELDS = new Set(["amountAgorot", "roeeShareAgorot", "avivShareAgorot"]);
const REQUIRED_ON_INSERT = ["מקור", "בית עסק", "קטגוריה", "סכום", "שילם", "משותף/פרטי", "חלק רועי", "חלק אביב"];

function applyPatch(base, value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw sheetError(`הערך ב${label} צריך להיות אובייקט של שדות.`);
  }
  const next = { ...base };
  for (const [key, raw] of Object.entries(value)) {
    if (key === "id") {
      if (String(raw) !== base.id) {
        throw sheetError(`הפעולה ${label} מנסה לשנות את המזהה של ${base.id}.`);
      }
      continue;
    }
    const field = PATCH_FIELDS[key];
    if (!field) {
      throw sheetError(`שדה לא מוכר ב${label}: ${key}.`);
    }
    if (field === "date") {
      if (raw === "" || raw === null) next.date = null;
      else if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) next.date = raw;
      else throw sheetError(`תאריך לא תקין ב${label}.`);
      continue;
    }
    if (MONEY_FIELDS.has(field)) {
      if (typeof raw !== "number") {
        throw sheetError(`סכום לא תקין ב${label}. ציפינו למספר בשקלים.`);
      }
      next[field] = shekelsToAgorot(raw);
      continue;
    }
    next[field] = raw;
  }
  const parsed = transactionSchema.safeParse(next);
  if (!parsed.success) {
    throw sheetError(`אחרי הפעולה ${label} השורה ${base.id} לא תואמת את מבנה התנועות.`);
  }
  return { ...parsed.data, pending: true };
}

function applyOne(rows, action) {
  const label = action.actionId;
  if (action.op === "מחיקה") {
    return rows.filter((row) => row.id !== action.targetId);
  }
  if (action.op === "עדכון") {
    const index = rows.findIndex((row) => row.id === action.targetId);
    if (index < 0) {
      throw sheetError(`פעולה ממתינה ${label} מפנה לשורה ${action.targetId} שלא קיימת.`);
    }
    const next = rows.slice();
    next[index] = applyPatch(rows[index], action.value, label);
    return next;
  }
  if (rows.some((row) => row.id === action.targetId)) {
    throw sheetError(`פעולה ממתינה ${label} מנסה להוסיף שורה ${action.targetId} שכבר קיימת.`);
  }
  const value = action.value || {};
  const missing = REQUIRED_ON_INSERT.filter((key) => !Object.prototype.hasOwnProperty.call(value, key));
  if (missing.length > 0) {
    throw sheetError(`פעולת הוספה ${label} חסרה שדות: ${missing.join(", ")}.`);
  }
  const base = {
    id: action.targetId,
    date: null,
    source: "",
    merchant: "",
    category: "",
    amountAgorot: 0,
    payer: "רועי",
    scope: "משותף",
    roeeShareAgorot: 0,
    avivShareAgorot: 0,
    notes: "",
  };
  return [...rows, applyPatch(base, value, label)];
}

/**
 * Only status ממתינה is applied. מוזגה was already merged by Angela into the
 * source tabs, so applying it again would double the change.
 */
function applyPendingActions(transactions, actions) {
  let rows = transactions.map((row) => ({ ...row, pending: false }));
  let pendingCount = 0;
  for (const action of actions) {
    if (action.status !== "ממתינה") continue;
    pendingCount += 1;
    rows = applyOne(rows, action);
  }
  return { transactions: rows, pendingCount };
}

module.exports = {
  applyPendingActions,
  PATCH_FIELDS,
};

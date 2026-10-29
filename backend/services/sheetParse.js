const { z } = require("zod");
const { agorotSchema, shekelsToAgorot } = require("./money");
const { sheetError } = require("./sheetError");

const rowIdSchema = z.string().regex(/^(mv|hm|rc|sp)-[A-Za-z0-9_-]+$/);

const TRANSACTIONS_HEADER = [
  "תאריך",
  "מקור",
  "בית עסק",
  "קטגוריה",
  "סכום",
  "שילם",
  "משותף/פרטי",
  "חלק רועי",
  "חלק אביב",
  "הערות",
  "id",
];

const SETTINGS_HEADER = ["מפתח", "ערך", "עודכן ע״י", "עודכן ב"];

const ACTIONS_HEADER = ["זמן", "משתמש", "פעולה", "id יעד", "ערך", "סטטוס", "id פעולה"];

const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  source: z.string().trim().min(1),
  merchant: z.string().trim().min(1),
  category: z.string().trim().min(1),
  amountAgorot: agorotSchema,
  payer: z.enum(["רועי", "אביב"]),
  scope: z.enum(["משותף", "פרטי", "לא סווג"]),
  roeeShareAgorot: agorotSchema,
  avivShareAgorot: agorotSchema,
  notes: z.string(),
  id: rowIdSchema,
});

const settingSchema = z.object({
  key: z.string().trim().min(1),
  value: z.string(),
  updatedBy: z.string(),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

const actionSchema = z.object({
  at: z.string().nullable(),
  user: z.string(),
  op: z.enum(["עדכון", "הוספה", "מחיקה"]),
  targetId: rowIdSchema,
  value: z.record(z.string(), z.unknown()).nullable(),
  status: z.enum(["ממתינה", "מוזגה"]),
  actionId: z.string().trim().min(1),
});

function assertRowId(id) {
  const parsed = rowIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error(
      `מזהה שורה לא תקין (${String(id)}). ציפינו לתחילית mv- / hm- / rc- / sp- ומזהה יציב.`,
    );
  }
  return parsed.data;
}

function normHeader(value) {
  return String(value ?? "")
    .normalize("NFC")
    .trim()
    .replace(/[\u05F3\u05F4'"`״׳]/g, "");
}

function assertHeader(row, expected, tab) {
  const actual = Array.isArray(row) ? row : [];
  const same =
    actual.length >= expected.length &&
    expected.every((cell, index) => normHeader(actual[index]) === normHeader(cell));
  if (!same) {
    throw sheetError(
      `הכותרת בטאב ${tab} לא תואמת. ציפינו ל: ${expected.join(" | ")}.`,
    );
  }
}

function isBlankRow(row) {
  if (!Array.isArray(row) || row.length === 0) return true;
  return row.every((cell) => cell === "" || cell === null || cell === undefined);
}

function cell(row, index) {
  if (!Array.isArray(row) || index >= row.length) return "";
  const value = row[index];
  return value === undefined || value === null ? "" : value;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function isoDate(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function serialToIso(serial) {
  const whole = Math.floor(serial);
  if (whole < 1 || whole > 200000) return null;
  const ms = Date.UTC(1899, 11, 30) + whole * 86400000;
  const date = new Date(ms);
  return isoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

function parseSheetDate(value, label) {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    const iso = serialToIso(value);
    if (!iso) throw sheetError(`${label} אינו תאריך.`);
    return iso;
  }
  if (typeof value !== "string") throw sheetError(`${label} אינו תאריך.`);
  const trimmed = value.trim();
  if (!trimmed) return null;
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (isoMatch) {
    const iso = isoDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
    if (!iso) throw sheetError(`${label} אינו תאריך.`);
    return iso;
  }
  const dmy = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(trimmed);
  if (dmy) {
    const iso = isoDate(Number(dmy[3]), Number(dmy[2]), Number(dmy[1]));
    if (!iso) throw sheetError(`${label} אינו תאריך.`);
    return iso;
  }
  throw sheetError(`${label} אינו תאריך.`);
}

function parseShekelCell(value, label) {
  if (value === "" || value === null || value === undefined) {
    throw sheetError(`סכום חסר ב${label}. תא ריק לא הופך לאפס.`);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) throw sheetError(`סכום חסר ב${label}. תא ריק לא הופך לאפס.`);
    throw sheetError(`סכום לא תקין ב${label}. ציפינו למספר, לא לטקסט.`);
  }
  if (typeof value !== "number") {
    throw sheetError(`סכום לא תקין ב${label}. ציפינו למספר בשקלים.`);
  }
  try {
    return shekelsToAgorot(value);
  } catch {
    throw sheetError(`סכום לא תקין ב${label}. ציפינו למספר שקלים שאפשר לשמור כאגורות שלמות.`);
  }
}

function zodOrThrow(schema, value, label) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue && issue.path.length ? issue.path.join(".") : "";
    const detail = issue && issue.message ? issue.message : "";
    throw sheetError(
      `הנתונים ב${label} לא תואמים את המבנה${path ? ` (${path})` : ""}${detail ? `: ${detail}` : "."}`,
    );
  }
  return parsed.data;
}

function parseTransactions(values) {
  const rows = Array.isArray(values) ? values : [];
  if (rows.length === 0) throw sheetError("טאב תנועות ריק, בלי שורת כותרת.");
  assertHeader(rows[0], TRANSACTIONS_HEADER, "תנועות");
  const transactions = [];
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (isBlankRow(row)) continue;
    const line = index + 1;
    const idRaw = cell(row, 10);
    const label = `שורה ${line} בתנועות${idRaw ? ` (${idRaw})` : ""}`;
    const draft = {
      date: parseSheetDate(cell(row, 0), `תאריך ב${label}`),
      source: cell(row, 1),
      merchant: cell(row, 2),
      category: cell(row, 3),
      amountAgorot: parseShekelCell(cell(row, 4), label),
      payer: cell(row, 5),
      scope: cell(row, 6),
      roeeShareAgorot: parseShekelCell(cell(row, 7), `${label} (חלק רועי)`),
      avivShareAgorot: parseShekelCell(cell(row, 8), `${label} (חלק אביב)`),
      notes: cell(row, 9) === "" ? "" : String(cell(row, 9)),
      id: idRaw,
    };
    transactions.push(zodOrThrow(transactionSchema, draft, label));
  }
  const seen = new Set();
  for (const transaction of transactions) {
    if (seen.has(transaction.id)) {
      throw sheetError(`מזהה כפול בתנועות: ${transaction.id}.`);
    }
    seen.add(transaction.id);
  }
  return transactions.map((transaction) => ({ ...transaction, pending: false }));
}

function settingValue(value) {
  if (value === "" || value === null || value === undefined) return "";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") return value.trim();
  throw sheetError("ערך בהגדרות אינו טקסט או מספר.");
}

function parseSettings(values) {
  const rows = Array.isArray(values) ? values : [];
  if (rows.length === 0) throw sheetError("טאב הגדרות ריק, בלי שורת כותרת.");
  assertHeader(rows[0], SETTINGS_HEADER, "הגדרות");
  const settings = [];
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (isBlankRow(row)) continue;
    const line = index + 1;
    const key = cell(row, 0);
    const label = `שורה ${line} בהגדרות${key ? ` (${key})` : ""}`;
    const draft = {
      key,
      value: settingValue(cell(row, 1)),
      updatedBy: cell(row, 2) === "" ? "" : String(cell(row, 2)),
      updatedAt: parseSheetDate(cell(row, 3), `תאריך עדכון ב${label}`),
    };
    settings.push(zodOrThrow(settingSchema, draft, label));
  }
  return settings;
}

function parseActionValue(value, label, op) {
  if (value === "" || value === null || value === undefined) {
    if (op === "מחיקה") return null;
    throw sheetError(`חסר ערך ב${label}.`);
  }
  let parsed = value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      if (op === "מחיקה") return null;
      throw sheetError(`חסר ערך ב${label}.`);
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw sheetError(`הערך ב${label} אינו JSON תקין.`);
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw sheetError(`הערך ב${label} צריך להיות אובייקט JSON.`);
  }
  return parsed;
}

function parseActions(values) {
  const rows = Array.isArray(values) ? values : [];
  if (rows.length === 0) throw sheetError("טאב פעולות ריק, בלי שורת כותרת.");
  assertHeader(rows[0], ACTIONS_HEADER, "פעולות");
  const actions = [];
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (isBlankRow(row)) continue;
    const line = index + 1;
    const actionId = cell(row, 6);
    const label = `שורה ${line} בפעולות${actionId ? ` (${actionId})` : ""}`;
    const op = typeof cell(row, 2) === "string" ? cell(row, 2).trim() : cell(row, 2);
    const status = typeof cell(row, 5) === "string" ? cell(row, 5).trim() : cell(row, 5);
    let at = null;
    const rawAt = cell(row, 0);
    if (rawAt !== "") {
      if (typeof rawAt === "number") at = parseSheetDate(rawAt, `זמן ב${label}`);
      else at = String(rawAt).trim();
    }
    const draft = {
      at,
      user: cell(row, 1) === "" ? "" : String(cell(row, 1)),
      op,
      targetId: cell(row, 3),
      value: parseActionValue(cell(row, 4), label, op),
      status,
      actionId,
    };
    actions.push(zodOrThrow(actionSchema, draft, label));
  }
  return actions;
}

function parseBalanceFinal(values) {
  const rows = Array.isArray(values) ? values : [];
  const raw = rows[0] && rows[0][0];
  if (raw === "" || raw === null || raw === undefined) {
    throw sheetError("balance_final חסר. אין מאזן להציג.");
  }
  if (typeof raw === "string") {
    throw sheetError("balance_final אינו מספר. טקסט לא הופך לאפס.");
  }
  let agorot;
  try {
    agorot = parseShekelCell(raw, "balance_final");
  } catch (error) {
    if (error.code === "SHEET_INVALID") throw error;
    throw sheetError("balance_final אינו מספר שאפשר לשמור כאגורות.");
  }
  return zodOrThrow(agorotSchema, agorot, "balance_final");
}

module.exports = {
  TRANSACTIONS_HEADER,
  SETTINGS_HEADER,
  ACTIONS_HEADER,
  transactionSchema,
  rowIdSchema,
  assertRowId,
  parseTransactions,
  parseSettings,
  parseActions,
  parseBalanceFinal,
  parseSheetDate,
};

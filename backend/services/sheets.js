const { z } = require("zod");

/**
 * TODO(PR #2): Google Sheet is the source of truth. There is no database.
 *
 * - Read with a service account that stays on the server.
 * - Read Angela's tabs. Write only to the tabs 'הגדרות' and 'פעולות'.
 * - On every read, apply rows in 'פעולות' whose status is 'ממתינה',
 *   matched by stable ids (mv- / hm- / rc- / sp-). Angela merges those
 *   rows and marks them 'מוזגה'.
 * - Cache the merged snapshot for 30–60 seconds. The client refreshes
 *   on that cadence.
 * - Validate with zod and fail with a clear error. Never turn a bad
 *   cell into a number.
 * - Money leaves this module as integer agorot.
 */

const rowIdSchema = z.string().regex(/^(mv|hm|rc|sp)-[A-Za-z0-9_-]+$/);
const agorotSchema = z.number().int().refine((value) => Number.isSafeInteger(value));

function assertRowId(id) {
  const parsed = rowIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error(
      `מזהה שורה לא תקין (${String(id)}). ציפינו לתחילית mv- / hm- / rc- / sp- ומזהה יציב.`,
    );
  }
  return parsed.data;
}

function assertAgorot(value) {
  const parsed = agorotSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("סכום לא תקין. ציפינו למספר שלם באגורות, בלי עיגול ובלי טקסט.");
  }
  return parsed.data;
}

async function readHousehold() {
  const error = new Error(
    "גיליון Google עדיין לא מחובר. החיבור יגיע ב-PR הבא, בלי להציג מספרים חלקיים.",
  );
  error.code = "SHEETS_NOT_CONFIGURED";
  throw error;
}

module.exports = {
  readHousehold,
  assertRowId,
  assertAgorot,
};

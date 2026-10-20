const { z } = require("zod");

// TODO: see docs/adr.md

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

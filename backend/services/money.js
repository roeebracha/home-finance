const { z } = require("zod");

const agorotSchema = z.number().int().refine((value) => Number.isSafeInteger(value));

function assertAgorot(value) {
  const parsed = agorotSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("סכום לא תקין. ציפינו למספר שלם באגורות, בלי עיגול ובלי טקסט.");
  }
  return parsed.data;
}

/**
 * Sheet cells are shekels. ₪21.81 → 2181 agorot.
 * Half an agora rounds away from zero. Binary junk like 21.809999999999974
 * is normalized through milli-shekels before that rounding.
 */
function shekelsToAgorot(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("סכום לא תקין. ציפינו למספר בשקלים, בלי טקסט.");
  }
  const millis = Math.round(value * 1000);
  const sign = millis < 0 ? -1 : 1;
  const abs = Math.abs(millis);
  const agorot = Math.floor(abs / 10) + (abs % 10 >= 5 ? 1 : 0);
  return assertAgorot(sign * agorot);
}

module.exports = {
  agorotSchema,
  assertAgorot,
  shekelsToAgorot,
};

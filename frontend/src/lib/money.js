const AGOROT_ERROR = "הסכום חייב להיות מספר שלם באגורות";

function assertAgorot(value) {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new TypeError(AGOROT_ERROR);
  }
}

function withCommas(digits) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Hero and card headlines: nearest shekel, no decimals. Half rounds away from zero. */
export function formatSummary(agorot) {
  assertAgorot(agorot);
  const shekels = Math.floor((Math.abs(agorot) + 50) / 100);
  if (shekels === 0) return "₪0";
  const body = withCommas(String(shekels));
  return agorot < 0 ? `-₪${body}` : `₪${body}`;
}

/** Receipts and list rows: always two decimals. 216857 agorot → ₪2,168.57. */
export function formatExact(agorot) {
  assertAgorot(agorot);
  const abs = Math.abs(agorot);
  const shekels = Math.floor(abs / 100);
  const fraction = String(abs % 100).padStart(2, "0");
  const body = `${withCommas(String(shekels))}.${fraction}`;
  if (agorot < 0 && abs !== 0) return `-₪${body}`;
  return `₪${body}`;
}

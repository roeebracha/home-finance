import { formatExact } from "./money";

/** Positive: Aviv owes Roee. Matches the מאזן sentence, with the exact agorot. */
export function balanceSentence(agorot) {
  if (agorot > 0) return `אביב חייבת לרועי ${formatExact(agorot)}`;
  if (agorot < 0) return `רועי חייב לאביב ${formatExact(Math.abs(agorot))}`;
  return "מאוזן — ₪0.00";
}

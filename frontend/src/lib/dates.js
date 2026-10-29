export function formatSheetDate(iso) {
  if (!iso || typeof iso !== "string") return "בלי תאריך";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "בלי תאריך";
  return `${match[3]}.${match[2]}.${match[1]}`;
}

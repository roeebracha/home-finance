export function firstName(user) {
  const full = String(user?.name || "").trim();
  if (!full) return "";
  return full.split(/\s+/)[0];
}

export function personKey(user) {
  const haystack = `${user?.name || ""} ${user?.email || ""}`.toLowerCase();
  if (haystack.includes("אביב") || haystack.includes("aviv")) return "aviv";
  if (
    haystack.includes("רועי") ||
    haystack.includes("roee") ||
    haystack.includes("roeebracha")
  ) {
    return "roee";
  }
  return "shared";
}

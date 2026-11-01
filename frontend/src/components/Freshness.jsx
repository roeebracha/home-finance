function formatUpdatedAt(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month} ${hours}:${minutes}`;
}

export default function Freshness({ updatedAt = null }) {
  const date = typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt;
  const valid = date instanceof Date && !Number.isNaN(date.getTime());
  const label = formatUpdatedAt(valid ? date : null);
  return (
    <p className="type-caption text-ink-muted">
      עודכן לאחרונה:{" "}
      <time className="amount" dateTime={valid ? date.toISOString() : undefined}>
        {label}
      </time>
    </p>
  );
}

import { SlidersHorizontal } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import Freshness from "@/components/Freshness";
import SheetStatus from "@/components/SheetStatus";
import { useTheme } from "@/hooks/useTheme";
import { useHousehold } from "@/data/HouseholdContext";
import { formatSheetDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { id: "system", label: "מערכת" },
  { id: "light", label: "בהיר" },
  { id: "dark", label: "כהה" },
];

const LABELS = {
  monthly_budget: "תקציב חודשי",
  avg_months: "חודשים לממוצע",
};

function settingLabel(key) {
  return LABELS[key] || key;
}

function settingValue(row) {
  if (!row.value) return "לא הוגדר";
  return row.value;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data } = useHousehold();

  return (
    <section className="col-span-1 flex flex-col gap-4 lg:col-span-12">
      <header>
        <h1 className="type-title">הגדרות</h1>
        <Freshness updatedAt={data?.updatedAt ?? null} />
      </header>

      <article className="card">
        <h2 className="type-heading">מראה</h2>
        <p className="mt-1 type-caption text-ink-muted">נשמר בדפדפן הזה בלבד.</p>
        <div
          role="radiogroup"
          aria-label="ערכת נושא"
          className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-surface-2 p-1"
        >
          {OPTIONS.map((option) => {
            const selected = theme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(option.id)}
                className={cn(
                  "min-h-11 rounded-full type-body-strong",
                  selected ? "bg-surface text-ink shadow-card" : "text-ink-muted",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </article>

      <article className="card">
        <h2 className="type-heading">מהגיליון</h2>
        <div className="mt-4">
          <SheetStatus>
            {data && data.settings.length === 0 ? (
              <EmptyState
                icon={SlidersHorizontal}
                title="אין הגדרות בגיליון"
                description="המפתחות יישמרו בטאב ההגדרות."
              />
            ) : null}
            {data && data.settings.length > 0 ? (
              <ul className="flex flex-col">
                {data.settings.map((row) => (
                  <li key={row.key} className="flex items-start justify-between gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
                    <div>
                      <p className="type-body-strong">{settingLabel(row.key)}</p>
                      <p className="mt-1 type-caption text-ink-muted">
                        {row.updatedBy ? `${row.updatedBy} · ` : ""}
                        {formatSheetDate(row.updatedAt)}
                      </p>
                    </div>
                    <p className="type-body">{settingValue(row)}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </SheetStatus>
        </div>
      </article>
    </section>
  );
}

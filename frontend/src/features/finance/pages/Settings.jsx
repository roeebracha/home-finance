import { SlidersHorizontal } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import Freshness from "@/components/Freshness";
import { ListSkeleton } from "@/components/skeletons";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { id: "system", label: "מערכת" },
  { id: "light", label: "בהיר" },
  { id: "dark", label: "כהה" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="col-span-1 flex flex-col gap-4 lg:col-span-12">
      <header>
        <h1 className="type-title">הגדרות</h1>
        <Freshness />
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
        <EmptyState
          icon={SlidersHorizontal}
          title="אין עדיין הגדרות מהגיליון"
          description="הגדרות הבית יישמרו בטאב ההגדרות. בחירת בהיר או כהה נשארת כאן, במכשיר."
        />
        <div className="mt-2 border-t border-border pt-5">
          <ListSkeleton rows={2} />
        </div>
      </article>
    </section>
  );
}

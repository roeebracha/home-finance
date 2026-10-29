import { useAuth } from "@/auth/AuthContext";
import Freshness from "@/components/Freshness";
import SheetStatus from "@/components/SheetStatus";
import { Badge } from "@/components/ui/badge";
import { useHousehold } from "@/data/HouseholdContext";
import { balanceSentence } from "@/lib/balance";
import { formatExact, formatSummary } from "@/lib/money";
import { firstName } from "@/lib/people";

export default function HomePage() {
  const { user } = useAuth();
  const { data, status } = useHousehold();
  const name = firstName(user);

  return (
    <section className="col-span-1 flex flex-col gap-4 lg:col-span-12" aria-busy={status === "loading"}>
      <header>
        <h1 className="type-title">{name ? `היי ${name}` : "היי"}</h1>
        <Freshness updatedAt={data?.updatedAt ?? null} />
        <ul className="mt-3 flex flex-wrap gap-2">
          <li>
            <Badge tone="shared">משותף</Badge>
          </li>
          <li>
            <Badge tone="roee">רועי</Badge>
          </li>
          <li>
            <Badge tone="aviv">אביב</Badge>
          </li>
        </ul>
      </header>

      <SheetStatus skeleton="hero">
        {data ? (
          <>
            <article className="card">
              <p className="type-caption text-ink-muted">מאזן</p>
              <p className="type-num-hero mt-2">{formatSummary(data.balanceAgorot)}</p>
              <p className="mt-2 type-body">{balanceSentence(data.balanceAgorot)}</p>
              <p className="mt-1 type-caption text-ink-muted">
                מדויק: <span className="amount">{formatExact(data.balanceAgorot)}</span>
              </p>
              {data.pendingCount > 0 ? (
                <p className="mt-3">
                  <Badge tone="soon">
                    כולל {data.pendingCount} {data.pendingCount === 1 ? "פעולה ממתינה" : "פעולות ממתינות"}
                  </Badge>
                </p>
              ) : null}
            </article>

            <article className="card">
              <p className="type-caption text-ink-muted">סה״כ הוצאות</p>
              <p className="type-num-lg mt-2">{formatSummary(data.spendAgorot)}</p>
              <p className="mt-1 type-caption text-ink-muted">
                <span className="amount">{formatExact(data.spendAgorot)}</span>
                {" · "}
                כל שורה נספרת, גם כשקבלה מפוצלת לכמה תשלומים
              </p>
            </article>
          </>
        ) : null}
      </SheetStatus>
    </section>
  );
}

import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/EmptyState";
import { formatSheetDate } from "@/lib/dates";
import { formatExact } from "@/lib/money";
import { sortByDateDesc } from "@/lib/rows";

function payerTone(payer) {
  if (payer === "רועי") return "roee";
  if (payer === "אביב") return "aviv";
  return "shared";
}

function scopeLabel(scope) {
  if (scope === "פרטי") return "פרטי";
  if (scope === "לא סווג") return "לא סווג";
  return "";
}

export default function TransactionList({ transactions, icon: Icon, emptyTitle, emptyDescription }) {
  if (!transactions.length) {
    return <EmptyState icon={Icon} title={emptyTitle} description={emptyDescription} />;
  }

  const rows = sortByDateDesc(transactions);

  return (
    <ul className="flex flex-col">
      {rows.map((row) => {
        const extraScope = scopeLabel(row.scope);
        return (
          <li key={row.id} className="flex items-start gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="type-body-strong">{row.merchant}</p>
                <Badge tone={payerTone(row.payer)}>{row.payer}</Badge>
                {row.pending ? <Badge tone="soon">ממתינה</Badge> : null}
                {extraScope ? <Badge tone="soon">{extraScope}</Badge> : null}
              </div>
              <p className="mt-1 type-caption text-ink-muted">
                {formatSheetDate(row.date)} · {row.category} · {row.source}
              </p>
              {row.notes ? <p className="mt-1 type-caption text-ink-muted">{row.notes}</p> : null}
            </div>
            <p className="type-num-md shrink-0">{formatExact(row.amountAgorot)}</p>
          </li>
        );
      })}
    </ul>
  );
}

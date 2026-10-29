import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/EmptyState";
import { sortByDateDesc } from "@/lib/rows";
import { formatSheetDate } from "@/lib/dates";
import { formatExact } from "@/lib/money";

function payerTone(payer) {
  if (payer === "רועי") return "roee";
  if (payer === "אביב") return "aviv";
  return "shared";
}

export default function ReceiptList({ receipts, icon: Icon, emptyTitle, emptyDescription }) {
  if (!receipts.length) {
    return <EmptyState icon={Icon} title={emptyTitle} description={emptyDescription} />;
  }

  const groups = sortByDateDesc(receipts);

  return (
    <ul className="flex flex-col gap-4">
      {groups.map((receipt) => (
        <li key={receipt.id}>
          <article className="rounded-lg bg-receipt-paper p-4 shadow-card">
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="type-heading">{receipt.merchant}</h2>
                <p className="mt-1 type-caption text-ink-muted">
                  {formatSheetDate(receipt.date)} · {receipt.category}
                </p>
              </div>
              <p className="type-num-md shrink-0">{formatExact(receipt.amountAgorot)}</p>
            </header>
            <ul className="mt-3 border-t border-dashed border-border pt-2">
              {receipt.rows.map((row) => (
                <li key={row.id} className="flex items-start justify-between gap-3 py-1.5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={payerTone(row.payer)}>{row.payer}</Badge>
                      {row.pending ? <Badge tone="soon">ממתינה</Badge> : null}
                    </div>
                    {row.notes ? <p className="mt-1 type-receipt text-ink-muted">{row.notes}</p> : null}
                  </div>
                  <p className="type-receipt shrink-0">{formatExact(row.amountAgorot)}</p>
                </li>
              ))}
            </ul>
          </article>
        </li>
      ))}
    </ul>
  );
}

import { Building2 } from "lucide-react";
import Freshness from "@/components/Freshness";
import SheetStatus from "@/components/SheetStatus";
import TransactionList from "@/components/TransactionList";
import { useHousehold } from "@/data/HouseholdContext";

export default function ApartmentPage() {
  const { data } = useHousehold();
  const rows = (data?.transactions || []).filter((row) => row.source === "בית משותף");

  return (
    <section className="col-span-1 flex flex-col gap-4 lg:col-span-12">
      <header>
        <h1 className="type-title">דירה</h1>
        <Freshness updatedAt={data?.updatedAt ?? null} />
      </header>
      <article className="card">
        <SheetStatus>
          {data ? (
            <TransactionList
              transactions={rows}
              icon={Building2}
              emptyTitle="אין הוצאות דירה"
              emptyDescription="שכר דירה וחשבונות מהבית המשותף יופיעו כאן."
            />
          ) : null}
        </SheetStatus>
      </article>
    </section>
  );
}

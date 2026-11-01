import { Receipt } from "lucide-react";
import Freshness from "@/components/Freshness";
import SheetStatus from "@/components/SheetStatus";
import TransactionList from "@/components/TransactionList";
import { useHousehold } from "@/data/HouseholdContext";

export default function ExpensesPage() {
  const { data } = useHousehold();

  return (
    <section className="col-span-1 flex flex-col gap-4 lg:col-span-12">
      <header>
        <h1 className="type-title">הוצאות</h1>
        <Freshness updatedAt={data?.updatedAt ?? null} />
      </header>
      <article className="card">
        <SheetStatus>
          {data ? (
            <TransactionList
              transactions={data.transactions}
              icon={Receipt}
              emptyTitle="אין תנועות בגיליון"
              emptyDescription="כשתהיה שורה בטאב תנועות היא תופיע כאן, עם תאריך, בית עסק ומי שילם."
            />
          ) : null}
        </SheetStatus>
      </article>
    </section>
  );
}

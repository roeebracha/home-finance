import { ShoppingCart } from "lucide-react";
import Freshness from "@/components/Freshness";
import ReceiptList from "@/components/ReceiptList";
import SheetStatus from "@/components/SheetStatus";
import { useHousehold } from "@/data/HouseholdContext";

export default function GroceriesPage() {
  const { data } = useHousehold();
  const receipts = (data?.receipts || []).filter((receipt) => receipt.source === "סופר");

  return (
    <section className="col-span-1 flex flex-col gap-4 lg:col-span-12">
      <header>
        <h1 className="type-title">סופר</h1>
        <Freshness updatedAt={data?.updatedAt ?? null} />
      </header>
      <SheetStatus>
        {data ? (
          <ReceiptList
            receipts={receipts}
            icon={ShoppingCart}
            emptyTitle="אין קבלות סופר"
            emptyDescription="שורות עם אותו קידומת מזהה, למשל קבלה ושורת סיבוס, מופיעות כאן כקבלה אחת."
          />
        ) : null}
      </SheetStatus>
    </section>
  );
}

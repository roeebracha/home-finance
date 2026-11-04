import { ShoppingCart } from "lucide-react";
import DataPage from "@/components/DataPage";

export default function GroceriesPage() {
  return (
    <DataPage
      title="סופר"
      icon={ShoppingCart}
      emptyTitle="אין עדיין קניות"
      emptyDescription="קבלות הסופר מהגיליון יופיעו כאן, שורה שורה."
    />
  );
}

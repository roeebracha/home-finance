import { Receipt } from "lucide-react";
import DataPage from "@/components/DataPage";

export default function ExpensesPage() {
  return (
    <DataPage
      title="הוצאות"
      icon={Receipt}
      emptyTitle="אין עדיין הוצאות"
      emptyDescription="כשנחבר את הגיליון, כל הוצאה תופיע כאן עם תאריך, בית עסק ומי שילם."
    />
  );
}

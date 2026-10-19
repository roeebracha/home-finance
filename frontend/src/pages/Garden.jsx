import { Sprout } from "lucide-react";
import DataPage from "@/components/DataPage";

export default function GardenPage() {
  return (
    <DataPage
      title="הגינה"
      icon={Sprout}
      soon
      emptyTitle="הגינה עדיין לא כאן"
      emptyDescription="המסך הזה בדרך. אין עדיין צמחים לטפל בהם."
    />
  );
}

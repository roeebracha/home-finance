import { Building2 } from "lucide-react";
import DataPage from "@/components/DataPage";

export default function ApartmentPage() {
  return (
    <DataPage
      title="דירה"
      icon={Building2}
      emptyTitle="אין עדיין נתוני דירה"
      emptyDescription="שכר דירה וחשבונות יגיעו מהגיליון."
    />
  );
}

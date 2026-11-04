import { Sprout } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { isGardenApiConfigured } from "@/features/garden/api";

export default function GardenPage() {
  const configured = isGardenApiConfigured();

  return (
    <section className="col-span-1 flex flex-col gap-4 lg:col-span-12">
      <header>
        <div className="flex items-center gap-2">
          <h1 className="type-title">גינה</h1>
          <Badge tone="soon">בקרוב</Badge>
        </div>
      </header>
      <article className="card">
        <EmptyState
          icon={Sprout}
          title="החיבור לגינה בדרך"
          description={
            configured
              ? "כתובת שרת הגינה מוגדרת. המסך עדיין לא פונה לשרת."
              : "מסך הגינה יתחבר לשרת הגינה כשהוא יהיה מוכן. עדיין אין כתובת, ואין קריאה."
          }
        />
      </article>
    </section>
  );
}

import { Wallet } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import EmptyState from "@/components/EmptyState";
import Freshness from "@/components/Freshness";
import { HeroSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { firstName } from "@/lib/people";

export default function HomePage() {
  const { user } = useAuth();
  const name = firstName(user);

  return (
    <section className="col-span-1 flex flex-col gap-4 lg:col-span-12">
      <header>
        <h1 className="type-title">{name ? `היי ${name}` : "היי"}</h1>
        <Freshness />
        <ul className="mt-3 flex flex-wrap gap-2">
          <li>
            <Badge tone="shared">משותף</Badge>
          </li>
          <li>
            <Badge tone="roee">רועי</Badge>
          </li>
          <li>
            <Badge tone="aviv">אביב</Badge>
          </li>
        </ul>
      </header>

      <article className="card">
        <p className="type-caption text-ink-muted">סה״כ הוצאות</p>
        <div className="mt-3">
          <HeroSkeleton />
        </div>
        <div className="mt-2 border-t border-border">
          <EmptyState
            icon={Wallet}
            title="אין עדיין נתוני הוצאות"
            description="הסכום יופיע כאן אחרי שנחבר את גיליון Google. עד אז אין מספר, כדי לא להציג סכום לא נכון."
          />
        </div>
      </article>
    </section>
  );
}

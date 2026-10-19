import EmptyState from "@/components/EmptyState";
import Freshness from "@/components/Freshness";
import { Badge } from "@/components/ui/badge";
import { HeroSkeleton, ListSkeleton } from "@/components/skeletons";

export default function DataPage({
  title,
  emptyTitle,
  emptyDescription,
  icon,
  soon = false,
  skeleton = "list",
}) {
  return (
    <section className="col-span-1 flex flex-col gap-4 lg:col-span-12">
      <header>
        <div className="flex items-center gap-2">
          <h1 className="type-title">{title}</h1>
          {soon ? <Badge tone="soon">בקרוב</Badge> : null}
        </div>
        <Freshness />
      </header>
      <article className="card">
        <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
        <div className="mt-2 border-t border-border pt-5">
          {skeleton === "hero" ? <HeroSkeleton /> : <ListSkeleton />}
        </div>
      </article>
    </section>
  );
}

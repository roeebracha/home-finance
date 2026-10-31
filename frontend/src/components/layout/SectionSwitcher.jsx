import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { sectionForPath, sections } from "@/sections";
import { cn } from "@/lib/utils";
import Icon from "./Icon";

export default function SectionSwitcher({ variant = "list" }) {
  const { pathname } = useLocation();
  const activeId = sectionForPath(pathname)?.id;
  const bar = variant === "bar";

  return (
    <nav
      aria-label="אזורים"
      className={
        bar
          ? "sticky top-16 z-20 flex gap-2 overflow-x-auto border-b border-border bg-surface px-4 py-2 lg:hidden"
          : "flex flex-col gap-1"
      }
    >
      {bar ? null : <p className="px-3 pb-1 type-micro text-ink-muted">אזורים</p>}
      {sections.map((section) => {
        const active = section.id === activeId;
        return (
          <Link
            key={section.id}
            to={section.to}
            aria-current={active ? "page" : undefined}
            className={
              bar
                ? cn(
                    "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 type-body-strong",
                    active ? "bg-brand-soft text-brand-strong" : "text-ink-muted",
                  )
                : cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 type-body",
                    active ? "bg-brand-soft text-brand-strong" : "text-ink",
                  )
            }
          >
            <Icon name={section.icon} size={bar ? 18 : 20} />
            <span className={bar ? undefined : "flex-1"}>{section.label}</span>
            {section.soon ? <Badge tone="soon">בקרוב</Badge> : null}
          </Link>
        );
      })}
    </nav>
  );
}

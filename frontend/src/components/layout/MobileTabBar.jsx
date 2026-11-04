import { useEffect, useId, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Icon from "./Icon";
import { navItems } from "./navItems";

const tabs = navItems.filter((item) => item.mobile === true);
const moreItems = navItems.filter((item) => item.mobile === "more");

export default function MobileTabBar() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [openPath, setOpenPath] = useState(null);
  const rootRef = useRef(null);
  const menuId = useId();
  const open = openPath === pathname && isMobile;
  const moreActive = moreItems.some((item) => pathname === item.to);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") setOpenPath(null);
    }
    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpenPath(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <nav className="flex h-16 items-stretch" aria-label="ניווט">
        {tabs.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center gap-1 type-micro",
                isActive ? "text-brand-strong" : "text-ink-muted",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full",
                    isActive && "bg-brand-soft",
                  )}
                >
                  <Icon name={item.icon} />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 type-micro",
            moreActive || open ? "text-brand-strong" : "text-ink-muted",
          )}
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onClick={() => setOpenPath((current) => (current === pathname ? null : pathname))}
        >
          <span
            className={cn(
              "grid size-8 place-items-center rounded-full",
              (moreActive || open) && "bg-brand-soft",
            )}
          >
            <Icon name="more" />
          </span>
          עוד
        </button>
        {open ? (
          <div
            id={menuId}
            className="absolute inset-x-4 bottom-full mb-2 rounded-lg bg-surface p-2 shadow-pop"
          >
            {moreItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-3 type-body",
                    isActive ? "bg-brand-soft text-brand-strong" : "text-ink",
                  )
                }
              >
                <Icon name={item.icon} size={20} />
                <span className="flex-1">{item.label}</span>
                {item.soon ? <Badge tone="soon">בקרוב</Badge> : null}
              </NavLink>
            ))}
          </div>
        ) : null}
      </nav>
    </div>
  );
}

import { matchPath, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { useActiveSection } from "@/hooks/useActiveSection";
import { firstName } from "@/lib/people";

export default function Topbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const section = useActiveSection();
  const current = section?.navItems.find((item) =>
    matchPath({ path: item.to, end: !!item.end }, pathname),
  );
  const name = firstName(user);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 lg:px-8">
      <p className="type-body-strong">{current?.label || section?.label || "הבית שלנו"}</p>
      <div className="ms-auto flex items-center gap-2">
        <span className="hidden type-caption text-ink-muted sm:inline">{name}</span>
        <Button variant="ghost" onClick={logout}>
          יציאה
        </Button>
      </div>
    </header>
  );
}

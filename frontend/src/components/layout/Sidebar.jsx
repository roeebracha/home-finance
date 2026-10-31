import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useActiveSection } from "@/hooks/useActiveSection";
import { firstName, personKey } from "@/lib/people";
import { cn } from "@/lib/utils";
import Icon from "./Icon";
import SectionSwitcher from "./SectionSwitcher";

const RING = {
  roee: "ring-person-roee",
  aviv: "ring-person-aviv",
  shared: "ring-brand",
};

function Avatar({ user }) {
  const [broken, setBroken] = useState(false);
  const key = personKey(user);
  const initial = (firstName(user) || "ב").slice(0, 1);
  const showPhoto = user?.picture && !broken;

  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-2 type-body-strong ring-2",
        RING[key],
      )}
    >
      {showPhoto ? (
        <img
          src={user.picture}
          alt=""
          className="size-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        initial
      )}
    </span>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const name = firstName(user);
  const navItems = useActiveSection()?.navItems ?? [];

  return (
    <aside className="sticky top-0 hidden h-svh w-[248px] shrink-0 flex-col border-e border-border bg-surface lg:flex">
      <div className="flex items-center gap-2 px-5 pt-6">
        <span className="grid size-9 place-items-center rounded-md bg-brand-soft text-brand">
          <Home size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="type-heading">הבית שלנו</span>
      </div>

      <div className="mt-6 flex items-center gap-3 px-5">
        <Avatar user={user} />
        <div className="min-w-0">
          <p className="truncate type-body-strong">{name ? `היי ${name}` : "היי"}</p>
          <p className="truncate type-caption text-ink-muted">{user?.email}</p>
        </div>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-6">
        <SectionSwitcher />
        {navItems.length > 0 ? (
          <nav className="flex flex-col gap-1 border-t border-border pt-4" aria-label="ניווט">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 type-body",
                    isActive ? "bg-brand-soft text-brand-strong" : "text-ink",
                  )
                }
              >
                <Icon name={item.icon} size={20} />
                <span className="flex-1">{item.label}</span>
                {item.soon ? <Badge tone="soon">בקרוב</Badge> : null}
              </NavLink>
            ))}
          </nav>
        ) : null}
      </div>
    </aside>
  );
}

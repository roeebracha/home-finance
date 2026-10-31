import { createElement } from "react";
import Apartment from "@/features/finance/pages/Apartment";
import Expenses from "@/features/finance/pages/Expenses";
import { financeNavItems } from "@/features/finance/navItems";
import Groceries from "@/features/finance/pages/Groceries";
import Home from "@/features/finance/pages/Home";
import Settings from "@/features/finance/pages/Settings";
import GardenPage from "@/features/garden/pages/Garden";

/**
 * App sections. To add one (for example בית חכם), append an object:
 *
 * {
 *   id: "smart-home",
 *   label: "בית חכם",
 *   icon: "home",
 *   to: "/smart-home",
 *   prefix: "/smart-home",
 *   soon: true,
 *   navItems: [],
 *   routes: [{ path: "/smart-home", element: createElement(SmartHomePage) }],
 * }
 *
 * `prefix` marks the section active on that path and anything under it.
 * Finance has no prefix: its screens stay on the original root paths.
 * Every section is rendered under ProtectedRoute, so login still gates all of them.
 */
export const sections = [
  {
    id: "finance",
    label: "כספים",
    icon: "finance",
    to: "/",
    navItems: financeNavItems,
    routes: [
      { path: "/", element: createElement(Home) },
      { path: "/expenses", element: createElement(Expenses) },
      { path: "/groceries", element: createElement(Groceries) },
      { path: "/apartment", element: createElement(Apartment) },
      { path: "/settings", element: createElement(Settings) },
    ],
  },
  {
    id: "garden",
    label: "גינה",
    icon: "garden",
    to: "/garden",
    prefix: "/garden",
    soon: true,
    navItems: [],
    routes: [
      { path: "/garden", element: createElement(GardenPage) },
      { path: "/garden/*", element: createElement(GardenPage) },
    ],
  },
];

export function normalizePathname(pathname) {
  if (typeof pathname !== "string" || pathname === "") return "/";
  const path = pathname.split(/[?#]/)[0];
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function sectionForPath(pathname) {
  const path = normalizePathname(pathname);
  const prefixed = sections.find((section) => {
    if (!section.prefix) return false;
    return path === section.prefix || path.startsWith(`${section.prefix}/`);
  });
  if (prefixed) return prefixed;
  return sections.find((section) => section.routes.some((route) => route.path === path)) ?? null;
}

export function sectionShowsMobileNav(section) {
  return (section?.navItems ?? []).some((item) => item.mobile === true || item.mobile === "more");
}

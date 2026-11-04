import { Outlet } from "react-router-dom";
import { useActiveSection } from "@/hooks/useActiveSection";
import { sectionShowsMobileNav } from "@/sections";
import { cn } from "@/lib/utils";
import MobileTabBar from "./MobileTabBar";
import SectionSwitcher from "./SectionSwitcher";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const section = useActiveSection();
  const hasTabBar = sectionShowsMobileNav(section);

  return (
    <div className="flex min-h-svh bg-background text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <SectionSwitcher variant="bar" />
        <main
          className={cn(
            "mx-auto grid w-full max-w-[1120px] flex-1 grid-cols-1 gap-4 px-4 pt-4 lg:grid-cols-12 lg:gap-5 lg:px-8 lg:pt-6 lg:pb-8",
            hasTabBar
              ? "pb-[calc(64px+env(safe-area-inset-bottom)+16px)]"
              : "pb-[max(16px,env(safe-area-inset-bottom))]",
          )}
        >
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}

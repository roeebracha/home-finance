import { Outlet } from "react-router-dom";
import MobileTabBar from "./MobileTabBar";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  return (
    <div className="flex min-h-svh bg-background text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto grid w-full max-w-[1120px] flex-1 grid-cols-1 gap-4 px-4 pt-4 pb-[calc(64px+env(safe-area-inset-bottom)+16px)] lg:grid-cols-12 lg:gap-5 lg:px-8 lg:pt-6 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}

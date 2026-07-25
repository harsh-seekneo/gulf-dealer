import { useState } from "react";
import { Outlet } from "react-router-dom";
import DealerSidebar from "../components/layout/DealerSidebar";
import DealerTopbar from "../components/layout/DealerTopbar";

export default function DealerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DealerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <DealerTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
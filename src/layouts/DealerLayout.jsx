import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import DealerSidebar from "../components/layout/DealerSidebar";
import DealerTopbar from "../components/layout/DealerTopbar";
import { getCompanyProfileApi } from "../modules/company/api/companyApi";

export default function DealerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyAddress, setCompanyAddress] = useState("");

  useEffect(() => {
    let isActive = true;

    getCompanyProfileApi()
      .then((profile) => {
        if (isActive) {
          setCompanyAddress(profile?.companyAddress || "");
        }
      })
      .catch(() => {
        if (isActive) {
          setCompanyAddress("");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-start bg-slate-50">
      <DealerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <DealerTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
        {companyAddress ? (
          <footer className="border-t border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-500 sm:px-6">
            {companyAddress}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

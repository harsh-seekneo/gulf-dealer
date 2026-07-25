import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Car,
  Users,
  Megaphone,
  CreditCard,
  Building2,
  Bell,
  X,
  LogOut,
} from "lucide-react";

import { logoutUserApi } from "../../modules/auth/api/authApi";
import { redirectToUserLogin } from "../../utils/authRedirect";
import { removeAccessToken } from "../../utils/tokenStorage";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
  { label: "Vehicles", path: "/vehicles", icon: Car, badgeKey: "vehicles" },
  { label: "Leads", path: "/leads", icon: Users, badgeKey: "leads" },
  { label: "Advertisements", path: "/advertisements", icon: Megaphone },
  { label: "Subscription", path: "/subscription", icon: CreditCard },
  { label: "Profile", path: "/profile", icon: Building2 },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
    badgeKey: "notifications",
  },
];

const badgeCounts = {
  vehicles: 6,
  leads: 8,
  notifications: 3,
};

export default function DealerSidebar({ isOpen, onClose }) {
  const dealerName = "Al-Rashid Motors";
  const tier = "Gold Dealer";

  const listingsUsed = 24;
  const listingsLimit = 50;

  const usagePct = Math.round((listingsUsed / listingsLimit) * 100);

  const handleLogout = async () => {
    try {
      await logoutUserApi();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      removeAccessToken();
      redirectToUserLogin();
    }
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold">
              G
            </div>

            <div>
              <p className="text-sm font-semibold">GulfInCart</p>
              <p className="text-xs text-slate-400">Dealer Portal</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dealer */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
            🚗
          </div>

          <div>
            <p className="text-sm font-semibold">{dealerName}</p>

            <p className="flex items-center gap-1 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {tier}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const badge =
              item.badgeKey != null ? badgeCounts[item.badgeKey] : null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>

                {badge != null && (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
                    {badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Subscription */}
        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-400">
              🏅 Gold Plan
            </p>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${usagePct}%` }}
              />
            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              {listingsUsed}/{listingsLimit} listings used
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

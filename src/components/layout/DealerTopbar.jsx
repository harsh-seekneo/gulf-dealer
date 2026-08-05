// [ADMIN] /Users/personal/Desktop/gulf-dealer/src/components/layout/DealerTopbar.jsx
import { Search, Bell, HelpCircle, ChevronDown, Menu } from "lucide-react";
import useAuth from "../../modules/auth/hooks/useAuth";

// Turns "Ahmed Al-Rashid" -> "AA", "Ahmed" -> "A", falls back to "?" if nothing usable
function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DealerTopbar({ onMenuClick }) {
  const { user, dealerStatus, isLoading } = useAuth();

  // TODO: confirm exact field names against the real /auth/me and
  // dealer/status payloads, then drop the unused fallbacks below.
  const dealerName =
    user?.name ||
    user?.fullName ||
    user?.dealerName ||
    user?.businessName ||
    "";

  const dealerTier =
    dealerStatus?.tier ||
    dealerStatus?.plan ||
    dealerStatus?.dealer?.tier ||
    dealerStatus?.dealer?.plan ||
    dealerStatus?.status ||
    "";

  const unreadCount = user?.unreadNotifications ?? 0;
  const initials = getInitials(dealerName);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="relative hidden flex-1 max-w-md sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search listings, leads, reports..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <button className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:block">
          <HelpCircle size={18} />
        </button>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-4">
          {isLoading ? (
            <>
              <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
              <div className="hidden space-y-1 sm:block">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-2.5 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            </>
          ) : (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {initials}
              </div>
              <div className="hidden text-sm sm:block">
                <p className="font-semibold leading-none">
                  {dealerName || "Dealer"}
                </p>
                <p className="text-xs text-slate-400">
                  {dealerTier || "-"}
                </p>
              </div>
            </>
          )}
          <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
        </div>
      </div>
    </header>
  );
}

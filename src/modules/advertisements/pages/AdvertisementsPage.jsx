import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Megaphone, Eye, DollarSign, MoreVertical } from "lucide-react";
import StatCard from "../../../components/ui/StatCard";
import { advertisementsApi } from "../api/advertisementsApi";

export default function AdvertisementsPage() {
  const [stats, setStats] = useState({ activeCampaigns: 0, totalViews: 0, totalSpent: 0 });
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await advertisementsApi.getSummary();
        setStats(data.stats || stats);
        setAds(data.ads || []);
      } catch (err) {
        console.error("Failed to load advertisements:", err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnd = async (adId) => {
    if (!window.confirm("End this ad campaign?")) return;
    await advertisementsApi.endAd(adId);
    setAds((prev) => prev.map((a) => (a._id === adId ? { ...a, status: "ended" } : a)));
    setOpenMenuId(null);
  };

  if (loading) return <p className="text-sm text-slate-400">Loading advertisements...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advertising Manager</h1>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          <Plus size={16} />
          Create Ad
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon={Megaphone} value={stats.activeCampaigns} label="Active Campaigns" iconBg="bg-blue-100 text-blue-600" />
        <StatCard icon={Eye} value={stats.totalViews?.toLocaleString()} label="Total Views" iconBg="bg-violet-100 text-violet-600" />
        <StatCard icon={DollarSign} value={`BHD ${stats.totalSpent}`} label="Total Spent" iconBg="bg-amber-100 text-amber-600" />
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-lg font-bold">Active Ads</h3>

        <div className="divide-y divide-slate-100">
          {ads.map((ad) => {
            const pct = ad.durationDays
              ? Math.round((ad.daysElapsed / ad.durationDays) * 100)
              : 0;

            return (
              <div key={ad._id} className="py-5">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/advertisements/${ad._id}`}
                    className="flex items-center gap-2 font-semibold text-slate-900 hover:text-blue-600"
                  >
                    {ad.vehicleTitle}
                    {ad.status === "active" && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    )}
                  </Link>

                  <div className="relative flex items-center gap-2">
                    {ad.status === "active" && (
                      <button
                        onClick={() => handleEnd(ad._id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        End
                      </button>
                    )}
                    <button
                      onClick={() => setOpenMenuId(openMenuId === ad._id ? null : ad._id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === ad._id && (
                      <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                        <Link
                          to={`/advertisements/${ad._id}`}
                          className="block px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          View Details
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-sm text-slate-400">Plan</p>
                <p className="text-sm font-semibold">{ad.planName}</p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="ml-3 shrink-0 text-xs text-slate-400">Ends {ad.endDate}</span>
                </div>
              </div>
            );
          })}

          {ads.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No active ads yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
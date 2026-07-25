import { useEffect, useState } from "react";
import { Plus, Megaphone, Users, CreditCard, Car, Eye, MessageSquare } from "lucide-react";
import StatCard from "../../../components/ui/StatCard";
import WeeklyViewsChart from "../components/WeeklyViewsChart";
import TopPerformingVehicles from "../components/TopPerformingVehicles";
import { dashboardApi } from "../api/dashboardApi";

export default function DashboardPage() {
  const [stats, setStats] = useState({ activeListings: 0, totalViews: 0, leadsReceived: 0 });
  const [weeklyViews, setWeeklyViews] = useState([]);
  const [topVehicles, setTopVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await dashboardApi.getSummary();
        setStats(data.stats || stats);
        setWeeklyViews(data.weeklyViews || []);
        setTopVehicles(data.topVehicles || []);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = [
    { label: "Add Vehicle", icon: Plus },
    { label: "Create Ad", icon: Megaphone },
    { label: "View Leads", icon: Users },
    { label: "Upgrade Plan", icon: CreditCard },
  ];

  if (loading) return <p className="text-sm text-slate-500">Loading dashboard...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            <a.icon size={16} />
            {a.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard icon={Car} value={stats.activeListings} label="Active Listings" iconBg="bg-blue-100 text-blue-600" />
        <StatCard icon={Eye} value={stats.totalViews?.toLocaleString()} label="Total Views" iconBg="bg-blue-100 text-blue-600" />
        <StatCard icon={MessageSquare} value={stats.leadsReceived} label="Leads Received" iconBg="bg-blue-100 text-blue-600" />
      </div>

      <WeeklyViewsChart data={weeklyViews} />

      <TopPerformingVehicles vehicles={topVehicles} />
    </div>
  );
}
//[DEALER] /Users/personal/Desktop/gulf--dealer/gulf-dealer/src/modules/dashboard/pages/DashboardPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Megaphone,
  Users,
  CreditCard,
  Car,
  Eye,
  MessageSquare,
} from "lucide-react";

import StatCard from "../../../components/ui/StatCard";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import WeeklyViewsChart from "../components/WeeklyViewsChart";
import TopPerformingVehicles from "../components/TopPerformingVehicles";

import { dashboardApi } from "../api/dashboardApi";
import { listingsApi } from "../../listings/api/listingsApi";
import { useListingViews } from "../hooks/useListingViews";

const DEFAULT_STATS = {
  activeListings: 0,
  totalViews: 0,
  leadsReceived: 0,
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(DEFAULT_STATS);
  const [weeklyViews, setWeeklyViews] = useState([]);
  const [topVehicles, setTopVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const { weeklyData, monthlyData, monthlyLoading, handleRangeChange } =
    useListingViews(weeklyViews);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [dashboardData, listingData] = await Promise.all([
        dashboardApi.getSummary(),
        listingsApi.getAll(),
      ]);

      setStats({
        activeListings: dashboardData?.stats?.activeListings ?? 0,
        totalViews: dashboardData?.stats?.totalViews ?? 0,
        leadsReceived: dashboardData?.stats?.leadsReceived ?? 0,
      });

      setWeeklyViews(
        Array.isArray(dashboardData?.weeklyViews)
          ? dashboardData.weeklyViews
          : []
      );

      let vehicles = [];

      if (
        Array.isArray(dashboardData?.topVehicles) &&
        dashboardData.topVehicles.length > 0
      ) {
        vehicles = dashboardData.topVehicles;
      } else if (Array.isArray(listingData?.items)) {
        vehicles = listingData.items;
      } else if (Array.isArray(listingData)) {
        vehicles = listingData;
      }

      const formattedVehicles = vehicles.map((vehicle) => ({
        ...vehicle,
        title: vehicle?.vehicleInfo?.title || "Unnamed Vehicle",
        price: vehicle?.pricing?.price || 0,
        image: vehicle?.media?.featuredImage || null,
        views: vehicle?.views || 0,
        daysRemaining: vehicle?.daysRemaining ?? null,
        daysLabel: vehicle?.daysLabel || "N/A",
      }));

      setTopVehicles(formattedVehicles);
    } catch (error) {
      console.error("Failed to load dashboard:", error);

      setStats(DEFAULT_STATS);
      setWeeklyViews([]);
      setTopVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: "Add Vehicle",
      icon: Plus,
      onClick: () => navigate("/vehicles"),
      border: "border-blue-200",
    },
    {
      label: "Create Ad",
      icon: Megaphone,
      onClick: () => navigate("/advertisements"),
      border: "border-emerald-200",
    },
    {
      label: "View Leads",
      icon: Users,
      onClick: () => navigate("/leads"),
      border: "border-teal-200",
    },
    {
      label: "Upgrade Plan",
      icon: CreditCard,
      onClick: () => navigate("/subscription"),
      border: "border-pink-200",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Dashboard" }]} />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`
              flex items-center gap-2.5
              rounded-xl
              border ${action.border}
              bg-blue-50/70
              px-6 py-4
              text-lg font-extrabold
              text-blue-700
              shadow-sm
              transition
              hover:bg-blue-100
            `}
          >
            <action.icon size={22} strokeWidth={2.4} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Car}
          value={stats.activeListings}
          label="Active Listings"
          iconBg="bg-blue-100 text-blue-600"
        />

        <StatCard
          icon={Eye}
          value={(stats.totalViews ?? 0).toLocaleString()}
          label="Total Views"
          iconBg="bg-blue-100 text-blue-600"
        />

        <StatCard
          icon={MessageSquare}
          value={stats.leadsReceived}
          label="Leads Received"
          iconBg="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Weekly Views */}
      <WeeklyViewsChart
        weeklyData={weeklyData}
        monthlyData={monthlyData}
        loading={monthlyLoading}
        onRangeChange={handleRangeChange}
      />

      {/* Top Performing Vehicles */}
      <TopPerformingVehicles vehicles={topVehicles} />
    </div>
  );
}
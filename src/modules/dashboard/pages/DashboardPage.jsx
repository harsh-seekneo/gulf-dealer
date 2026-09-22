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
  BadgeCheck,
  CalendarDays,
  RotateCcw,
  Star,
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
  totalListingsUsed: 0,
  advertisementsUsed: 0,
  advertisementPlacements: [],
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB");
};

const getStatusClasses = (active) =>
  active
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-50 text-slate-500";

const UsageLimit = ({ label, used = 0, limit }) => {
  const numericUsed = Number(used || 0);
  const numericLimit = limit === null || limit === undefined ? null : Number(limit);

  if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
    return (
      <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-extrabold text-slate-900">
          {numericUsed.toLocaleString()} / Unlimited
        </p>
      </div>
    );
  }

  const percent = Math.min(100, Math.round((numericUsed / numericLimit) * 100));

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-extrabold text-slate-900">
          {numericUsed.toLocaleString()} / {numericLimit.toLocaleString()}
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

const AdPlacementUsage = ({ placements = [] }) => (
  <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 sm:col-span-2">
    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
      Advertisement usage
    </p>
    <div className="mt-3 grid gap-3">
      {placements.map((placement) => {
        const used = Number(placement.used || 0);
        const limit =
          placement.limit === null || placement.limit === undefined
            ? null
            : Number(placement.limit);
        const hasLimit = Number.isFinite(limit) && limit > 0;
        const percent = hasLimit ? Math.min(100, Math.round((used / limit) * 100)) : 0;

        return (
          <div key={placement.category}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-700">{placement.label}</span>
              <span className="font-extrabold text-slate-900">
                {used.toLocaleString()} / {hasLimit ? limit.toLocaleString() : "Unlimited"}
              </span>
            </div>
            {hasLimit ? (
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  </div>
);

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(DEFAULT_STATS);
  const [subscription, setSubscription] = useState(null);
  const [featuredDealer, setFeaturedDealer] = useState(null);
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
        totalListingsUsed: dashboardData?.stats?.totalListingsUsed ?? 0,
        advertisementsUsed: dashboardData?.stats?.advertisementsUsed ?? 0,
        advertisementPlacements: dashboardData?.stats?.advertisementPlacements || [],
      });
      setSubscription(dashboardData?.subscription || null);
      setFeaturedDealer(dashboardData?.featuredDealer || null);

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
      setSubscription(null);
      setFeaturedDealer(null);
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
      label: "Renew Plan",
      icon: CreditCard,
      onClick: () => navigate("/subscription?renew=dealer"),
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

      {/* Current Plan */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-600">
                <BadgeCheck size={16} />
                Dealer Page Subscription
              </p>
              <h2 className="mt-2 truncate text-xl font-bold text-slate-900">
                {subscription?.planNameSnapshot || "Current Plan"}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays size={15} />
                Expires {formatDate(subscription?.endDate)}
              </p>
              {subscription?.offerReason ? (
                <p className="mt-2 text-sm font-medium text-amber-700">
                  {subscription.offerReason}
                </p>
              ) : null}
            </div>

            <span
              className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                subscription?.status === "ACTIVE"
              )}`}
            >
              {subscription?.status || "N/A"}
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {subscription?.daysLabel || "N/A"}
              </p>
              {subscription?.daysTotal ? (
                <p className="mt-1 text-sm text-slate-500">
                  {subscription.daysUsed || 0}/{subscription.daysTotal} days used
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => navigate("/subscription?renew=dealer")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <RotateCcw size={16} />
              Renew Plan
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <UsageLimit
              label="Listings used"
              used={stats.totalListingsUsed}
              limit={subscription?.limits?.listings}
            />
            <AdPlacementUsage placements={stats.advertisementPlacements} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-600">
                <Star size={16} />
                Featured Dealer Add-on
              </p>
              <h2 className="mt-2 truncate text-xl font-bold text-slate-900">
                Featured Dealer
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays size={15} />
                Expires {formatDate(featuredDealer?.endDate)}
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                featuredDealer?.active
              )}`}
            >
              Featured Dealer - {featuredDealer?.active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {featuredDealer?.daysLabel || "Not purchased"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {featuredDealer?.purchased
                  ? "Renew this add-on separately from the dealer page plan"
                  : "Purchase the add-on to promote this dealer profile"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/subscription?renew=featured-dealer")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
            >
              <RotateCcw size={16} />
              {featuredDealer?.purchased ? "Renew Add-on" : "Add Featured Dealer"}
            </button>
          </div>
        </div>
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

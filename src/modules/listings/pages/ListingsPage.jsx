import { useEffect, useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { getDealerStatusApi } from "../../dealer/api/dealerApi";
import { useNavigate } from "react-router-dom";

import ListingsTabs from "../components/ListingsTabs";
import ListingsTable from "../components/ListingsTable";
import { listingsApi } from "../api/listingsApi";
import { LISTING_TABS } from "../listings.constants";

export default function ListingsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isCheckingPlan, setIsCheckingPlan] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusCounts, setStatusCounts] = useState({});

  const loadVehicles = async () => {
    setLoading(true);

    try {
      const selectedTab = LISTING_TABS.find(
        (tab) => tab.key === activeTab
      );

      const data = await listingsApi.getAll({
        status: selectedTab?.status,
        search: search || undefined,
      });

      const mappedVehicles = (data.items || []).map((listing) => ({
        ...listing,

        title: listing.vehicleInfo?.title,
        year: listing.vehicleInfo?.manufacturingYear,
        mileage: listing.vehicleInfo?.mileage,
        fuelType: listing.vehicleInfo?.fuelType,

        price: listing.pricing?.price,

        thumbnailUrl:
          listing.media?.featuredImage?.url ||
          listing.media?.images?.[0]?.url ||
          "/images/placeholder-car.png",
      }));

      setVehicles(mappedVehicles);
      setTotalCount(data.pagination?.totalItems || 0);
    } catch (err) {
      console.error("Failed to load listings:", err);
      setVehicles([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadStatusCounts = async () => {
    try {
      const results = await Promise.all(
        LISTING_TABS.map((tab) =>
          listingsApi.getAll({ status: tab.status, limit: 1 }).then((data) => ({
            key: tab.key,
            count: data.pagination?.totalItems || 0,
          }))
        )
      );

      const counts = {};
      results.forEach((result) => {
        counts[result.key] = result.count;
      });

      setStatusCounts(counts);
    } catch (err) {
      console.error("Failed to load status counts:", err);
    }
  };

  useEffect(() => {
  loadVehicles();
  loadStatusCounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab]);

useEffect(() => {

  const timer = setTimeout(() => {

    loadVehicles();

  }, 500);


  return () => clearTimeout(timer);


  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [search]);

  const handleDelete = (vehicle) => {
    setDeleteTarget(vehicle);
  };

 const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      await listingsApi.deleteVehicle(deleteTarget._id);
      setDeleteTarget(null);
      loadVehicles();
      loadStatusCounts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFeatured = async (vehicle) => {
    try {
      await listingsApi.toggleFeatured(vehicle._id);
      loadVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSold = async (vehicle) => {
    try {
      await listingsApi.toggleSold(vehicle._id);
      loadVehicles();
      loadStatusCounts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNewVehicle = async () => {
    if (isCheckingPlan) return;

    setIsCheckingPlan(true);

    try {
      const { dealer } = await getDealerStatusApi();
      const subscriptionId = dealer?.business?.businessSubscriptionRef?._id;

      if (!subscriptionId) {
        alert(
          "No active business plan found. Please complete your dealer subscription to start listing vehicles."
        );
        return;
      }

      navigate(`/listings/add-vehicle?subscriptionId=${subscriptionId}`);
    } catch (err) {
      console.error("Failed to check dealer status:", err);
      alert("Unable to verify your plan. Please try again.");
    } finally {
      setIsCheckingPlan(false);
    }
  };

  const handleEdit = (vehicle) => {
    window.location.href = `/vehicles/${vehicle._id}/edit`;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>

          <a
            href="/vehicles"
            className="text-sm text-blue-600"
          >
            View all Listings
          </a>
        </div>

        <button
          onClick={handleAddNewVehicle}
          disabled={isCheckingPlan}
          className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
        >
          <Plus size={16} />
          {isCheckingPlan ? "Checking..." : "Add New Vehicle"}
        </button>
      </div>

      <ListingsTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        statusCounts={statusCounts}
      />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search vehicles by name, make, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadVehicles()}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>

        {activeTab === "pending" && (
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600">
            <Filter size={16} />
            Filter
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">
          Loading listings...
        </p>
      ) : (
        <ListingsTable
          tab={activeTab}
          vehicles={vehicles}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
          onToggleSold={handleToggleSold}
        />
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Delete this listing?</h3>
            <p className="mt-2 text-sm text-slate-500">
              &quot;{deleteTarget.title || "This listing"}&quot; will be permanently deleted. This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
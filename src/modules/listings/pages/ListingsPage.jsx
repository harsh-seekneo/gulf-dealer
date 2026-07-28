import { useEffect, useState } from "react";
import { Search, Plus, Filter } from "lucide-react";

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

  useEffect(() => {
  loadVehicles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab]);


useEffect(() => {

  const timer = setTimeout(() => {

    loadVehicles();

  }, 500);


  return () => clearTimeout(timer);


  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [search]);

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Delete "${vehicle.title}"?`)) return;

    try {
      await listingsApi.deleteVehicle(vehicle._id);
      loadVehicles();
    } catch (err) {
      console.error(err);
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

        <button className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          <Plus size={16} />
          Add New Vehicle
        </button>
      </div>

      <ListingsTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        totalCount={totalCount}
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
        />
      )}
    </div>
  );
}
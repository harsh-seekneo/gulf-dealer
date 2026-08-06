import { useEffect, useState } from "react";
import { X, Eye, MousePointerClick, FileText, Star } from "lucide-react";

import { leadsApi } from "../../leads/api/leadsApi";

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(
    new Date(value)
  );
};

const parseDurationDays = (durationLabel) => {
  if (!durationLabel) return null;
  const match = String(durationLabel).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

const ListingQuickViewModal = ({ vehicle, onClose }) => {
  const [leadsCount, setLeadsCount] = useState(null);

  useEffect(() => {
    if (!vehicle?._id) return;

    let isMounted = true;

    leadsApi
      .getAll({ listingId: vehicle._id, limit: 1 })
      .then((result) => {
        if (isMounted) setLeadsCount(result.totalCount || 0);
      })
      .catch(() => {
        if (isMounted) setLeadsCount(0);
      });

    return () => {
      isMounted = false;
    };
  }, [vehicle?._id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!vehicle) return null;

  const vehicleInfo = vehicle.vehicleInfo || {};
  const startDate = vehicle.submittedAt || vehicle.publishedAt || vehicle.createdAt;
  const durationDays = parseDurationDays(vehicle.planLimitsSnapshot?.listingDurationSnapshot);

  const endDate =
    startDate && durationDays
      ? new Date(new Date(startDate).getTime() + durationDays * 24 * 60 * 60 * 1000)
      : null;

  const planName = vehicle.planLimitsSnapshot?.planNameSnapshot || "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={
                vehicle.media?.featuredImage?.url ||
                vehicle.media?.images?.[0]?.url ||
                "/images/placeholder-car.png"
              }
              alt={vehicleInfo.title}
              className="h-14 w-14 rounded-xl object-cover"
            />
            <div>
              <h3 className="text-base font-bold text-slate-950">{vehicleInfo.title || "Untitled"}</h3>
              <p className="text-xs text-slate-500">
                {vehicleInfo.manufacturingYear} · {vehicleInfo.mileage?.toLocaleString() || 0} km ·{" "}
                {vehicleInfo.fuelType || vehicle.specs?.fuelType || "—"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Eye size={16} />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-950">
              {(vehicle.viewCount || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Impressions</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <MousePointerClick size={16} />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-950">
              {vehicle.interactionsCount ?? 0}
            </p>
            <p className="text-xs text-slate-500">Interactions</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <FileText size={16} />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-950">
              {leadsCount === null ? "…" : leadsCount}
            </p>
            <p className="text-xs text-slate-500">Leads</p>
          </div>
        </div>

        <p className="mb-2 mt-5 text-sm font-semibold text-slate-900">Listing Details</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-400">Listing Start Date</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{formatDate(startDate)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-400">Listing End Date</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{formatDate(endDate)}</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Plan Selected</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
              <Star size={11} />
              {planName}
            </span>
            <span className="text-sm font-medium text-slate-700">{planName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingQuickViewModal;
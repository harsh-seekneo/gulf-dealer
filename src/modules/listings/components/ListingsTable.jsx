//[DEALER] /Users/personal/Desktop/gulf--dealer/gulf-dealer/src/modules/listings/components/ListingsTable.jsx

import { SquarePen, Trash2 } from "lucide-react";
import { formatListingPrice } from "../listings.constants";
import { getServiceCountryCurrencyByName } from "../config/gulfLocations.config";

function formatDaysLabel(label) {
  if (!label) return "—";

  if (/expired/i.test(label)) return "Ended";

  const match = label.match(/(\d+)\s*days?\s*remaining/i);
  if (match) return `${match[1]} Days`;

  return label;
}

function isEnded(label) {
  return Boolean(label) && /expired/i.test(label);
}

function getDaysColorClass(label, tab) {
  // Active and Sold tabs always render the Days value in red,
  // whether it's "Ended" or a remaining-days count.
  if (tab === "active" || tab === "sold") return "text-red-500";

  if (isEnded(label)) return "text-red-500";

  return "text-slate-500";
}

const SOURCE_LABELS = {
  DEALER_BUSINESS: "Dealer",
  USER_BULK: "Bulk",
  USER_INDIVIDUAL: "Individual",
  ADMIN: "Admin",
};

function getListingSourceLabel(listing) {
  const rawSource =
    listing?.sourceName ||
    listing?.importSource ||
    listing?.source?.name ||
    listing?.source ||
    listing?.listingSource ||
    (listing?.createdByAdmin ? "ADMIN" : "");

  const normalized = String(rawSource || "").trim();
  return SOURCE_LABELS[normalized] || normalized || "Unknown";
}

export default function ListingsTable({
  tab,
  vehicles,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleSold,
  onRowClick,
}) {
  const visibleVehicles =
    tab === "active"
      ? vehicles.filter((v) => !isEnded(v.daysLabel))
      : vehicles;

  if (!visibleVehicles.length) {
    return (
      <div className="rounded-xl bg-white p-12 text-center text-sm text-slate-400 shadow-sm">
        No vehicles found in this tab.
      </div>
    );
  }

  const showDays = tab === "all" || tab === "active" || tab === "sold";
  const showViews = tab === "all" || tab === "active" || tab === "sold";
  const showInteractions = tab === "sold";
  const showLeads = tab === "all" || tab === "active" || tab === "sold";
  const showStatus = tab === "pending" || tab === "rejected";
  const showReason = tab === "rejected";
  const showPrice = tab !== "rejected";
  const showFeatured = tab === "all";
  const showMarkAsSold = tab === "active";
  const showSoldBadge = tab === "sold";

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full min-w-[800px] text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-2 py-3 font-semibold">Vehicle</th>
            <th className="px-2 py-3 font-semibold">Source</th>

            {showPrice && <th className="px-2 py-3 font-semibold">Price</th>}

            {showReason && <th className="px-2 py-3 font-semibold">Reason</th>}
            {showDays && (
              <th
                className={`px-2 py-3 font-semibold ${
                  tab === "active" || tab === "sold" ? "text-red-500" : ""
                }`}
              >
               Days Remaining
              </th>
            )}

            {showViews && <th className="px-2 py-3 font-semibold">Views</th>}
            {showInteractions && <th className="px-2 py-3 font-semibold">Interactions</th>}
            {showLeads && <th className="px-2 py-3 font-semibold">Leads</th>}
            {showStatus && <th className="px-2 py-3 font-semibold">Status</th>}

            <th className="px-2 py-3 font-semibold">Actions</th>

            
            {showSoldBadge && <th className="px-2 py-3 font-semibold">Status</th>}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {visibleVehicles.map((v) => {
            const ended = isEnded(v.daysLabel);
            const isSold = Boolean(v.isSold) || v.status === "SOLD";
            const canFeature = v.status === "PUBLISHED" && !ended;

            return (
              <tr
                key={v._id}
                onClick={() => onRowClick(v)}
                className="cursor-pointer transition-colors duration-150 hover:bg-slate-50"
              >
                {/* <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                </td> */}

                <td className="px-2 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        v.media?.featuredImage?.url ||
                        v.media?.images?.[0]?.url ||
                        "/images/placeholder-car.png"
                      }
                      alt={v.vehicleInfo?.title}
                      className="h-12 w-16 rounded-lg bg-slate-100 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{v.vehicleInfo?.title}</p>
                      <p className="text-xs text-slate-400">
                        {v.vehicleInfo?.manufacturingYear} • {v.vehicleInfo?.mileage?.toLocaleString() || 0} km •{" "}
                        {v.vehicleInfo?.fuelType || v.specs?.fuelType || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-2 py-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    Source: {getListingSourceLabel(v)}
                  </span>
                </td>

                {showPrice && (
                  <td className="px-2 py-4 font-semibold">
                    {formatListingPrice(
                      v,
                      v.pricing?.currency || getServiceCountryCurrencyByName(v.location?.country)
                    )}
                  </td>
                )}

                {showReason && (
                  <td className="px-2 py-4 font-semibold">{v.rejectionReason || "—"}</td>
                )}

                {showDays && (
                  <td className={`px-2 py-4 font-semibold ${getDaysColorClass(v.daysLabel, tab)}`}>
                    {isSold ? "Sold" : formatDaysLabel(v.daysLabel)}
                  </td>
                )}

                {showViews && <td className="px-2 py-4">{v.views?.toLocaleString() ?? 0}</td>}

                {showInteractions && (
                  <td className="px-2 py-4">{v.interactions?.toLocaleString() ?? 0}</td>
                )}

                {showLeads && (
                  <td className="px-2 py-4 font-semibold text-blue-600">{v.leadsCount ?? 0}</td>
                )}

                {showStatus && (
                  <td className="px-2 py-4">
                    <span
                      className={`text-sm font-semibold ${
                        tab === "pending" ? "text-amber-500" : "text-red-500"
                      }`}
                    >
                      {tab === "pending" ? "Pending for approval" : "Rejected"}
                    </span>
                  </td>
                )}

                <td className="px-2 py-4" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => onEdit(v)} className="text-slate-400 hover:text-slate-700">
                      <SquarePen size={16} />
                    </button>
                    <button onClick={() => onDelete(v)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>

                    {showMarkAsSold && !isSold && (
                      <button
                        onClick={() => onToggleSold(v)}
                        className="ml-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        Mark as Sold
                      </button>
                    )}
                  </div>
                </td>

               

                {showSoldBadge && (
                  <td className="px-2 py-4">
                    <span className="text-sm font-semibold text-slate-500">
                      Sold
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

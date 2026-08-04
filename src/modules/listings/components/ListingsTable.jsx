import { Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "../listings.constants";

export default function ListingsTable({
  tab,
  vehicles,
  onEdit,
  onDelete,
  onToggleFeatured,
}) {
  if (!vehicles.length) {
    return (
      <div className="rounded-xl bg-white p-12 text-center text-sm text-slate-400 shadow-sm">
        No vehicles found in this tab.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full min-w-[800px] text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="w-10 px-4 py-3"></th>
            <th className="px-2 py-3 font-semibold">Vehicle</th>
            <th className="px-2 py-3 font-semibold">Price</th>

            {tab === "rejected" ? (
              <th className="px-2 py-3 font-semibold">Reason</th>
            ) : (
              <th className="px-2 py-3 font-semibold">Days</th>
            )}

            {(tab === "all" || tab === "active" || tab === "sold") && (
              <th className="px-2 py-3 font-semibold">Views</th>
            )}

            {tab === "sold" && (
              <th className="px-2 py-3 font-semibold">Interactions</th>
            )}

            {(tab === "all" || tab === "active" || tab === "sold") && (
              <th className="px-2 py-3 font-semibold">Leads</th>
            )}

            {(tab === "pending" || tab === "rejected") && (
              <th className="px-2 py-3 font-semibold">Status</th>
            )}

            <th className="px-2 py-3 font-semibold">Actions</th>

            {tab === "all" && (
              <th className="px-2 py-3 font-semibold">Featured Listing</th>
            )}

            {tab === "sold" && (
              <th className="px-2 py-3 font-semibold">Status</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {vehicles.map((v) => (
            <tr key={v._id}>
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                />
              </td>

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
                    <p className="font-semibold text-slate-900">
                      {v.vehicleInfo?.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {v.vehicleInfo?.manufacturingYear} •{" "}
                      {v.vehicleInfo?.mileage?.toLocaleString()} km •{" "}
                      {v.vehicleInfo?.fuelType}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-2 py-4 font-semibold">
                {formatPrice(v.pricing?.price)}
              </td>

              {tab === "rejected" ? (
                <td className="px-2 py-4 font-semibold">
                  {v.rejectionReason || "—"}
                </td>
              ) : (
                <td
                  className={`px-2 py-4 font-semibold ${
                    v.daysRemaining > 7
                      ? "text-green-600"
                      : v.daysRemaining > 0
                        ? "text-orange-500"
                        : "text-red-600"
                  }`}
                >
                  {v.daysLabel}
                </td>
              )}

              {(tab === "all" || tab === "active" || tab === "sold") && (
                <td className="px-2 py-4">{v.views?.toLocaleString() ?? 0}</td>
              )}

              {tab === "sold" && (
                <td className="px-2 py-4">
                  {v.interactions?.toLocaleString() ?? 0}
                </td>
              )}

              {(tab === "all" || tab === "active" || tab === "sold") && (
                <td className="px-2 py-4 font-semibold text-blue-600">
                  {v.leadsCount ?? 0}
                </td>
              )}

              {(tab === "pending" || tab === "rejected") && (
                <td className="px-2 py-4">
                  <span
                    className={`text-sm font-semibold ${
                      tab === "pending" ? "text-amber-500" : "text-red-500"
                    }`}
                  >
                    {tab === "pending" ? "Pending for Approval" : "Rejected"}
                  </span>
                </td>
              )}

              <td className="px-2 py-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit(v)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(v)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>

              {tab === "all" && (
                <td className="px-2 py-4">
                  {v.status === "PUBLISHED" ? (
                    <button
                      onClick={() => onToggleFeatured(v)}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Add as Featured
                    </button>
                  ) : (
                    <span className="text-sm text-slate-300">
                      Add as Featured
                    </span>
                  )}
                </td>
              )}

              {tab === "sold" && (
                <td className="px-2 py-4 text-sm font-semibold text-slate-700">
                  Marked as Sold
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useMemo, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function ComparePlansTable({ plans = [] }) {
  const [open, setOpen] = useState(true);

  const rows = useMemo(() => {
    return [
      {
        label: "Listing Duration",
        key: "listingDuration",
      },
      {
        label: "Active Listings",
        key: "activeListingCount",
      },
      {
        label: "Maximum Photos",
        key: "maxPhotos",
      },
      {
        label: "Maximum Videos",
        key: "maxVideos",
      },
      {
        label: "Vehicle Video",
        key: "hasVehicleVideo",
      },
      {
        label: "Visibility",
        key: "visibility",
      },
      {
        label: "Featured Listing",
        key: "hasFeaturedListing",
      },
      {
        label: "Auto Refresh",
        key: "hasAutomaticListingRefresh",
      },
      {
        label: "WhatsApp Enquiries",
        key: "hasWhatsappPhoneEnquiries",
      },
      {
        label: "Admin Approval",
        key: "requiresAdminApproval",
      },
    ];
  }, []);

  if (!plans.length) {
    return null;
  }

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 px-5 py-4 text-left text-sm font-semibold"
      >
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
        Compare Plans
      </button>

      {open && (
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">
                  Feature
                </th>

                {plans.map((plan) => (
                  <th
                    key={plan._id}
                    className="px-5 py-3 text-center font-semibold"
                  >
                    {plan.planName}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="px-5 py-3 font-medium">
                    {row.label}
                  </td>

                  {plans.map((plan) => {
                    const value = plan[row.key];

                    return (
                      <td
                        key={plan._id}
                        className="px-5 py-3 text-center"
                      >
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check
                              size={16}
                              className="mx-auto text-emerald-500"
                            />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )
                        ) : value !== null &&
                          value !== undefined &&
                          value !== "" ? (
                          value
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr>
                <td className="px-5 py-3 font-medium">
                  Features
                </td>

                {plans.map((plan) => (
                  <td
                    key={plan._id}
                    className="px-5 py-3 align-top"
                  >
                    <ul className="space-y-1">
                      {(plan.features || []).map((feature) => (
                        <li key={feature}>• {feature}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
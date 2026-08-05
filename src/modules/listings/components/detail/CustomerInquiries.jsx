import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { leadsApi } from "../../../leads/api/leadsApi";

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value)
  );
};

const getInitials = (name = "") =>
  name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

const CustomerInquiries = ({ listingId, onCountLoaded }) => {
  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const result = await leadsApi.getAll({ listingId, limit: 20 });

        if (isMounted) {
          setLeads(result.leads || []);
          setTotalCount(result.totalCount || 0);
          onCountLoaded?.(result.totalCount || 0);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.response?.data?.message || "Unable to load inquiries");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLeads();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Customer Inquiries</h3>
        <span className="text-xs font-semibold text-blue-600">{totalCount} Total</span>
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <Loader2 size={20} className="animate-spin text-slate-400" />
        </div>
      )}

      {loadError && (
        <p className="text-sm text-red-600">{loadError}</p>
      )}

      {!isLoading && !loadError && leads.length === 0 && (
        <p className="py-4 text-center text-sm text-slate-400">No inquiries yet for this listing</p>
      )}

      {!isLoading && leads.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-2 py-2 font-medium">Customer</th>
                <th className="px-2 py-2 font-medium">Date</th>
                <th className="px-2 py-2 font-medium">Message</th>
                <th className="px-2 py-2 font-medium">Email</th>
                <th className="px-2 py-2 font-medium">Mobile Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead._id || lead.id}>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700">
                        {getInitials(lead.name)}
                      </span>
                      <span className="font-medium text-slate-800">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-slate-500">{formatDate(lead.createdAt)}</td>
                  <td className="max-w-[220px] truncate px-2 py-3 text-slate-600">{lead.message || "—"}</td>
                  <td className="px-2 py-3 text-slate-600">{lead.email || "—"}</td>
                  <td className="px-2 py-3 text-slate-600">
                    {lead.countryCode} {lead.phone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerInquiries;
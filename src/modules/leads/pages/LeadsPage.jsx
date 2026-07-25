import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { leadsApi } from "../api/leadsApi";

function initials(name = "") {
  return name.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [newTodayCount, setNewTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await leadsApi.getAll();
        setLeads(data.leads || []);
        setTotalCount(data.totalCount ?? data.leads?.length ?? 0);
        setNewTodayCount(data.newTodayCount ?? 0);
      } catch (err) {
        console.error("Failed to load leads:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await leadsApi.exportCrm();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "leads-export.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Management</h1>
          <p className="text-sm text-slate-500">
            {totalCount} total leads · {newTodayCount} new today
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Download size={16} />
          {exporting ? "Exporting..." : "Export CRM"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Vehicle</th>
              <th className="px-5 py-3 font-semibold">Message</th>
              <th className="px-5 py-3 font-semibold">Mobile Number</th>
              <th className="px-5 py-3 font-semibold">Email Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead._id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {initials(lead.customerName)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{lead.customerName}</p>
                      <p className="text-xs text-slate-400">{lead.customerPhone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">{lead.vehicleTitle}</td>
                <td className="px-5 py-4 text-slate-400">{lead.message}</td>
                <td className="px-5 py-4">{lead.mobileNumber}</td>
                <td className="px-5 py-4">{lead.email}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && leads.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">No leads yet</p>
        )}
      </div>
    </div>
  );
}
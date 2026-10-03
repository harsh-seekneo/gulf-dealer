import { Download, FileText, Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageLoader from "../../../components/ui/PageLoader";
import { subscriptionApi } from "../api/subscriptionApi";

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatMoney = (amount, currency = "BHD") =>
  `${currency} ${Number(amount || 0).toFixed(3)}`;

const statusClass = (status = "") => {
  const normalized = String(status).toUpperCase();
  if (normalized === "CAPTURED" || normalized === "ACTIVE") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (normalized === "EXPIRED" || normalized === "FAILED") {
    return "bg-red-50 text-red-700";
  }
  return "bg-slate-100 text-slate-700";
};

const printInvoice = () => {
  window.print();
};

export default function BillingHistoryPage() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const selectedId = searchParams.get("invoice");

  useEffect(() => {
    let isActive = true;

    subscriptionApi
      .getBillingHistory()
      .then((history) => {
        if (isActive) setItems(Array.isArray(history) ? history : []);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const selectedInvoice = useMemo(() => {
    if (!items.length) return null;
    return items.find((item) => String(item._id) === String(selectedId)) || items[0];
  }, [items, selectedId]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-2 pb-10">
      <div className="no-print flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">Billing</p>
          <h1 className="text-3xl font-bold text-slate-950">Billing History</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review dealer subscription payments and download invoices.
          </p>
        </div>
        <Link
          to="/subscription"
          className="w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to subscription
        </Link>
      </div>

      {!items.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          No billing records found.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_460px]">
          <section className="no-print overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">Payments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    {["Invoice", "Plan", "Paid On", "Amount", "Payment", "Action"].map((heading) => (
                      <th key={heading} className="px-5 py-3 font-bold">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr
                      key={item._id}
                      className={String(item._id) === String(selectedInvoice?._id) ? "bg-blue-50/60" : ""}
                    >
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs font-bold text-slate-900">{item.invoiceNumber}</p>
                        <p className="text-xs text-slate-500">{item.subscriptionId}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">{item.planName}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(item.paidAt)}</td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">
                        {formatMoney(item.amount, item.currency)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(item.paymentStatus)}`}>
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          to={item.invoiceUrl || `/subscription/billing?invoice=${item._id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
                        >
                          <FileText size={16} />
                          View invoice
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {selectedInvoice && (
            <aside className="invoice-panel rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="no-print mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={printInvoice}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={printInvoice}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>

              <div className="invoice-document">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">GulfInCart</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">Tax Invoice</h2>
                    <p className="mt-1 text-sm text-slate-500">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(selectedInvoice.paymentStatus)}`}>
                    {selectedInvoice.paymentStatus}
                  </span>
                </div>

                <div className="grid gap-4 border-b border-slate-200 py-5 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Billed To</p>
                    <p className="mt-1 font-bold text-slate-950">{selectedInvoice.businessName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Payment Date</p>
                    <p className="mt-1 font-bold text-slate-950">{formatDate(selectedInvoice.paidAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Subscription</p>
                    <p className="mt-1 font-bold text-slate-950">{selectedInvoice.subscriptionId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Payment ID</p>
                    <p className="mt-1 break-all font-mono text-xs font-bold text-slate-950">{selectedInvoice.paymentId || "-"}</p>
                  </div>
                </div>

                <div className="py-5">
                  <div className="rounded-lg border border-slate-200">
                    <div className="grid grid-cols-[1fr_auto] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500">
                      <span>Description</span>
                      <span>Amount</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] px-4 py-4 text-sm">
                      <div>
                        <p className="font-bold text-slate-950">{selectedInvoice.planName}</p>
                        <p className="mt-1 text-slate-500">
                          {selectedInvoice.isRenewal ? "Renewal" : "Dealer subscription"} · {formatDate(selectedInvoice.startDate)} to {formatDate(selectedInvoice.endDate)}
                        </p>
                      </div>
                      <p className="font-bold text-slate-950">{formatMoney(selectedInvoice.amount, selectedInvoice.currency)}</p>
                    </div>
                  </div>
                </div>

                <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Wallet</span>
                    <span>{formatMoney(selectedInvoice.walletAmount, selectedInvoice.currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Online Paid</span>
                    <span>{formatMoney(selectedInvoice.onlineAmount, selectedInvoice.currency)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black text-slate-950">
                    <span>Total</span>
                    <span>{formatMoney(selectedInvoice.amount, selectedInvoice.currency)}</span>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-panel, .invoice-panel * { visibility: visible; }
          .invoice-panel {
            position: absolute;
            inset: 0;
            width: 100%;
            border: 0 !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

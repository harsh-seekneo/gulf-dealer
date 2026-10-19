import { downloadInvoicePdf } from "../../../utils/downloadInvoice";

import { ArrowLeft, Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import apiClient from "../../../services/apiClient";
import PageLoader from "../../../components/ui/PageLoader";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "-";

const formatMoney = (value, currency = "BHD") =>
  `${currency} ${Number(value || 0).toFixed(3)}`;

export default function InvoicePage() {
  const { paymentId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const handleDownload = async (preview = false) => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadError("");
    try {
      await downloadInvoicePdf(`/payments/${paymentId}/invoice/download`, invoice.invoiceNumber, preview);
    } catch (error) {
      setDownloadError(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    let active = true;

    apiClient
      .get(`/payments/${paymentId}/invoice`)
      .then(({ data }) => {
        if (active) setInvoice(data.data);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Unable to load invoice");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [paymentId]);

  if (loading) return <PageLoader />;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-600">{error}</div>;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/subscription/billing" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600">
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="flex gap-2">
          <button type="button" disabled={isDownloading} onClick={() => handleDownload()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
            <Download size={16} />
            Download Invoice
          </button>
          <button type="button" disabled={isDownloading} onClick={() => handleDownload(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600">
            <Printer size={16} />
            Print / Save PDF
          </button>
        </div>
      </div>

      {downloadError && <p role="alert" className="no-print mb-4 text-sm text-red-600">{downloadError}</p>}
      <section className="invoice-document rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">GulfInCart</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">{invoice.title}</h1>
            <p className="mt-1 font-mono text-sm font-bold text-slate-500">{invoice.invoiceNumber}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{invoice.status}</span>
        </div>

        <div className="grid gap-4 border-b border-slate-200 py-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase text-slate-400">Billed To</p>
            <p className="mt-1 font-black text-slate-950">{invoice.billedTo?.name}</p>
            <p className="text-slate-500">{invoice.billedTo?.email || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase text-slate-400">Payment</p>
            <p className="mt-1 font-mono font-black text-slate-950">{invoice.paymentId}</p>
            <p className="text-slate-500">{formatDate(invoice.paidAt)} - {invoice.paymentMethod}</p>
          </div>
        </div>

        <div className="overflow-x-auto py-6">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 font-black">Description</th>
                <th className="px-4 py-3 font-black">Reference</th>
                <th className="px-4 py-3 text-right font-black">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems?.map((item, index) => (
                <tr key={`${item.description}-${index}`} className="border-b border-slate-100">
                  <td className="px-4 py-4 font-bold text-slate-950">{item.description}</td>
                  <td className="px-4 py-4 text-slate-500">{item.reference || "-"}</td>
                  <td className="px-4 py-4 text-right font-black text-slate-950">{formatMoney(item.amount, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between text-slate-500"><span>Wallet</span><span>{formatMoney(invoice.walletAmount, invoice.currency)}</span></div>
          <div className="flex justify-between text-slate-500"><span>Online Paid</span><span>{formatMoney(invoice.onlineAmount, invoice.currency)}</span></div>
          {invoice.discount > 0 && <div className="flex justify-between text-slate-500"><span>Discount</span><span>- {formatMoney(invoice.discount, invoice.currency)}</span></div>}
          {invoice.vatAmount > 0 && <div className="flex justify-between text-slate-500"><span>{invoice.vatRate == null ? "VAT" : `VAT (${invoice.vatRate}%)`}</span><span>{formatMoney(invoice.vatAmount, invoice.currency)}</span></div>}
          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black text-slate-950"><span>Total</span><span>{formatMoney(invoice.total, invoice.currency)}</span></div>
        </div>
      </section>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-document, .invoice-document * { visibility: visible; }
          .invoice-document { position: absolute; inset: 0; border: 0 !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

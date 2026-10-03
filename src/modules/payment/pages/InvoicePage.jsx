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

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildInvoiceHtml = (invoice) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(invoice.invoiceNumber)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; }
      .top { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
      h1 { margin: 6px 0 0; font-size: 28px; }
      .muted { color: #64748b; font-size: 13px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 24px 0; }
      .box { border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
      th { background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #64748b; }
      .right { text-align: right; }
      .total { margin-left: auto; width: 280px; margin-top: 20px; font-size: 15px; }
      .total div { display: flex; justify-content: space-between; padding: 8px 0; }
      .strong { font-weight: 800; }
    </style>
  </head>
  <body>
    <div class="top">
      <div><div class="muted">GulfInCart</div><h1>${escapeHtml(invoice.title)}</h1><div class="muted">${escapeHtml(invoice.invoiceNumber)}</div></div>
      <div class="right"><div class="strong">${escapeHtml(invoice.status)}</div><div class="muted">Paid on ${escapeHtml(formatDate(invoice.paidAt))}</div></div>
    </div>
    <div class="grid">
      <div class="box"><div class="muted">Billed To</div><div class="strong">${escapeHtml(invoice.billedTo?.name || "-")}</div><div>${escapeHtml(invoice.billedTo?.email || "")}</div></div>
      <div class="box"><div class="muted">Payment ID</div><div class="strong">${escapeHtml(invoice.paymentId || "-")}</div><div>${escapeHtml(invoice.paymentMethod || "")}</div></div>
    </div>
    <table>
      <thead><tr><th>Description</th><th>Reference</th><th class="right">Amount</th></tr></thead>
      <tbody>${(invoice.lineItems || [])
        .map(
          (item) =>
            `<tr><td>${escapeHtml(item.description)}</td><td>${escapeHtml(item.reference || "-")}</td><td class="right">${escapeHtml(formatMoney(item.amount, invoice.currency))}</td></tr>`,
        )
        .join("")}</tbody>
    </table>
    <div class="total">
      <div><span>Wallet</span><span>${escapeHtml(formatMoney(invoice.walletAmount, invoice.currency))}</span></div>
      <div><span>Online Paid</span><span>${escapeHtml(formatMoney(invoice.onlineAmount, invoice.currency))}</span></div>
      <div class="strong"><span>Total</span><span>${escapeHtml(formatMoney(invoice.total, invoice.currency))}</span></div>
    </div>
  </body>
</html>`;

const downloadInvoice = (invoice) => {
  const blob = new Blob([buildInvoiceHtml(invoice)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoice.invoiceNumber || "invoice"}.html`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function InvoicePage() {
  const { paymentId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          <button type="button" onClick={() => downloadInvoice(invoice)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
            <Download size={16} />
            Download Invoice
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600">
            <Printer size={16} />
            Print / Save PDF
          </button>
        </div>
      </div>

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

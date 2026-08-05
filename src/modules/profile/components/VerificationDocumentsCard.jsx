import { useRef, useState } from "react";
import { FileText, Lock, Upload } from "lucide-react";

const statusClasses = {
  PENDING: "bg-amber-100 text-amber-700",
  VERIFIED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const statusLabels = {
  PENDING: "Pending Review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export default function VerificationDocumentsCard({
  documents = [],
  locked = false,
  onUpload,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const tradeLicense =
    documents.find(
      (doc) =>
        doc.type === "TRADE_LICENSE_CERTIFICATE" ||
        doc.name === "Trade License Certificate" ||
        doc.name === "Trade Licence Certificate",
    ) || null;

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || locked) return;

    setUploading(true);
    try {
      await onUpload?.(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Verification Document</h3>
        {locked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <Lock size={13} />
            Locked
          </span>
        ) : null}
      </div>

      {tradeLicense ? (
        <a
          href={tradeLicense.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <FileText size={18} className="shrink-0 text-blue-500" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                Trade License Certificate
              </p>
              <p className="text-xs text-slate-400">
                Uploaded document
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              statusClasses[tradeLicense.status] || statusClasses.PENDING
            }`}
          >
            {statusLabels[tradeLicense.status] || statusLabels.PENDING}
          </span>
        </a>
      ) : (
        <p className="rounded-lg border border-dashed border-red-200 bg-red-50 px-4 py-4 text-center text-sm font-semibold text-red-600">
          Trade License Certificate is required.
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      {!locked ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-60"
        >
          <Upload size={16} />
          {uploading ? "Uploading..." : tradeLicense ? "Replace Document" : "Upload Document"}
        </button>
      ) : (
        <p className="mt-3 text-xs font-medium text-slate-400">
          Approved dealers cannot change the Trade License Certificate.
        </p>
      )}
    </div>
  );
}

import { useRef } from "react";
import { FileText, Upload } from "lucide-react";

export default function VerificationDocumentsCard({ documents, onUpload }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-4 text-lg font-bold">Verification Documents</h3>

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{doc.name}</p>
                <p className="text-xs text-slate-400">Expires {doc.expiresOn}</p>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                doc.status === "verified"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {doc.status === "verified" ? "Verified" : "Draft"}
            </span>
          </div>
        ))}

        {documents.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">No documents uploaded yet</p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600"
      >
        <Upload size={16} />
        Upload Document
      </button>
    </div>
  );
}
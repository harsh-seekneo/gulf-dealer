const SellerInfoCard = ({ listing }) => {
  const location = listing?.location;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Seller Information</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2 sm:border-0 sm:pb-0">
          <span className="text-xs text-slate-400">Seller Name</span>
          <span className="text-sm font-semibold text-slate-800">{listing?.owner?.fullName || "—"}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-50 pb-2 sm:border-0 sm:pb-0">
          <span className="text-xs text-slate-400">Phone</span>
          <span className="text-sm font-semibold text-slate-800">
            {location?.showPhoneNumber ? `${listing?.owner?.countryCode || ""} ${listing?.owner?.phone || ""}` : "Hidden"}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-50 pb-2 sm:border-0 sm:pb-0">
          <span className="text-xs text-slate-400">WhatsApp</span>
          <span className="text-sm font-semibold text-slate-800">
            {location?.showWhatsappNumber ? `${listing?.owner?.countryCode || ""} ${listing?.owner?.phone || ""}` : "Hidden"}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-50 pb-2 sm:border-0 sm:pb-0">
          <span className="text-xs text-slate-400">Location</span>
          <span className="text-sm font-semibold text-slate-800">
            {[location?.city, location?.country].filter(Boolean).join(", ") || "—"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SellerInfoCard;
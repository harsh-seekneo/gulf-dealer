const DEVICE_WIDTHS = {
  desktop: "100%",
  tablet: "600px",
  mobile: "375px",
};

export default function AdPreview({ ad, device, onDeviceChange }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold">Advertisement Preview</h3>
        <div className="flex overflow-hidden rounded-lg border border-slate-200">
          {["desktop", "tablet", "mobile"].map((d) => (
            <button
              key={d}
              onClick={() => onDeviceChange(d)}
              className={`px-3 py-1.5 text-sm font-medium capitalize ${
                device === d ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-3">
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2">gulfincart.com</span>
        </div>

        <div className="flex justify-center overflow-x-auto">
          <div
            className="relative overflow-hidden rounded-lg bg-slate-200"
            style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%", height: 200 }}
          >
            <img
              src={ad.bannerImageUrl}
              alt={ad.vehicleTitle}
              className="h-full w-full object-cover"
            />
            <span className="absolute right-2 top-2 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Ad
            </span>
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4">
              <span className="mb-2 w-fit rounded bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                Premium Listing
              </span>
              <h4 className="text-lg font-bold text-white">{ad.vehicleTitle}</h4>
              <p className="text-sm text-white/80">
                BHD {ad.price?.toLocaleString()} · {ad.mileage?.toLocaleString()} km · {ad.specs}
              </p>
              <button className="mt-2 w-fit rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">
                View Listing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
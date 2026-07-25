export default function TopPerformingVehicles({ vehicles }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Top Performing Vehicles</h3>
        <a href="/vehicles" className="text-sm font-semibold text-blue-600">
          View All
        </a>
      </div>

      <div className="divide-y divide-slate-100">
        {vehicles.map((v) => (
          <div key={v._id} className="flex items-center gap-4 py-4">
            <img
              src={v.thumbnailUrl}
              alt={v.title}
              className="h-14 w-20 rounded-lg object-cover bg-slate-100"
            />
            <div className="flex-1">
              <p className="font-semibold">{v.title}</p>
              <p className="text-sm text-slate-500">BHD {v.price?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{v.views?.toLocaleString()}</p>
              <p className="text-xs text-slate-400">views</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-blue-600">{v.leadsCount}</p>
              <p className="text-xs text-slate-400">leads</p>
            </div>
          </div>
        ))}

        {vehicles.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">No vehicles yet</p>
        )}
      </div>
    </div>
  );
}
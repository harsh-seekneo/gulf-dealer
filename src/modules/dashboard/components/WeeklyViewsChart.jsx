export default function WeeklyViewsChart({ data }) {
  const max = Math.max(1000, ...data.map((d) => d.views || 0));
  const days = data.length
    ? data
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({ day, views: 0 }));

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold">Average Listing Views</h3>
        <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          This Week
        </span>
      </div>

      <div className="flex items-end gap-6 border-b border-slate-100 pb-2">
        {days.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-64 w-full items-end justify-center">
              <div
                className="w-10 rounded-t-md bg-blue-600"
                style={{ height: `${((d.views || 0) / max) * 100}%`, minHeight: 4 }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-6">
        {days.map((d) => (
          <div key={d.day} className="flex-1 text-center text-xs text-slate-500">
            {d.day}
          </div>
        ))}
      </div>
    </div>
  );
}
const DAY_LABELS = {
  sun_thu: "Sun–Thu",
  fri: "Friday",
  sat: "Saturday",
};

export default function WorkingHoursCard({ hours }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-4 text-lg font-bold">Working Hours</h3>
      <div className="divide-y divide-slate-100">
        {hours.map((h) => (
          <div key={h.key} className="flex items-center justify-between py-3 text-sm">
            <span className="font-medium text-slate-700">{DAY_LABELS[h.key] || h.label}</span>
            <span className={h.closed ? "font-semibold text-red-500" : "font-semibold text-slate-900"}>
              {h.closed ? "Closed" : `${h.opens} – ${h.closes}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
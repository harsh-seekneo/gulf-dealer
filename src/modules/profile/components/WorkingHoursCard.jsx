const DAY_LABELS = {
  sun_thu: "Sun–Thu",
  fri: "Friday",
  sat: "Saturday",
};

export default function WorkingHoursCard({ hours = [] }) {
  // Convert object -> array if required
  const formattedHours = Array.isArray(hours)
    ? hours
    : [
        {
          key: "sun_thu",
          closed:
            !hours?.sun?.open &&
            !hours?.mon?.open &&
            !hours?.tue?.open &&
            !hours?.wed?.open &&
            !hours?.thu?.open,
          opens:
            hours?.mon?.opens ||
            hours?.sun?.opens ||
            "",
          closes:
            hours?.mon?.closes ||
            hours?.sun?.closes ||
            "",
        },
        {
          key: "fri",
          closed: !hours?.fri?.open,
          opens: hours?.fri?.opens || "",
          closes: hours?.fri?.closes || "",
        },
        {
          key: "sat",
          closed: !hours?.sat?.open,
          opens: hours?.sat?.opens || "",
          closes: hours?.sat?.closes || "",
        },
      ];

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-4 text-lg font-bold">
        Working Hours
      </h3>

      <div className="divide-y divide-slate-100">
        {formattedHours.map((h) => (
          <div
            key={h.key}
            className="flex items-center justify-between py-3 text-sm"
          >
            <span className="font-medium text-slate-700">
              {DAY_LABELS[h.key] || h.label}
            </span>

            <span
              className={
                h.closed
                  ? "font-semibold text-red-500"
                  : "font-semibold text-slate-900"
              }
            >
              {h.closed
                ? "Closed"
                : `${h.opens} – ${h.closes}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
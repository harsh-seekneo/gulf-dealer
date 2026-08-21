import { useMemo } from "react";

const DAYS = [
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
];

const defaultDay = { open: false, opens: "09:00", closes: "18:00" };

const to12Hour = (value) => {
  if (!value) return "";
  const [hourStr, minuteStr] = value.split(":");
  let hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minuteStr} ${period}`;
};

// Groups consecutive days that share the same open/closed state and times,
// e.g. Sun-Thu all 9-6 collapse into one row, Fri (different hours) and
// Sat (closed) each stay on their own row.
const groupDays = (hours = {}) => {
  const days = DAYS.map((day) => ({
    ...day,
    value: { ...defaultDay, ...(hours?.[day.key] || {}) },
  }));

  const groups = [];

  for (const day of days) {
    const last = groups[groups.length - 1];
    const sameAsLast =
      last &&
      last.value.open === day.value.open &&
      (!day.value.open ||
        (last.value.opens === day.value.opens &&
          last.value.closes === day.value.closes));

    if (sameAsLast) {
      last.labels.push(day.label);
    } else {
      groups.push({ labels: [day.label], value: day.value });
    }
  }

  return groups.map((group) => ({
    label:
      group.labels.length > 1
        ? `${group.labels[0]}-${group.labels[group.labels.length - 1]}`
        : group.labels[0],
    value: group.value,
  }));
};

export default function WorkingHoursDisplay({ hours = {} }) {
  const groups = useMemo(() => groupDays(hours), [hours]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">Working Hours</h3>

      <div className="mt-3 border-t border-slate-100">
        {groups.map((group, index) => (
          <div
            key={`${group.label}-${index}`}
            className="flex items-center justify-between gap-3 py-3.5 border-b border-slate-50 last:border-b-0"
          >
            <span className="text-slate-700">{group.label}</span>

            {group.value.open ? (
              <span className="font-semibold text-slate-900">
                {to12Hour(group.value.opens)} &ndash; {to12Hour(group.value.closes)}
              </span>
            ) : (
              <span className="font-semibold text-red-500">Closed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
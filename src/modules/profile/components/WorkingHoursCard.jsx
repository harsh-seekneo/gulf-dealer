import { useEffect, useState } from "react";

const DAYS = [
  { key: "sun", label: "Sunday" },
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
];

const defaultDay = { open: false, opens: "09:00", closes: "18:00" };

const normalizeHours = (hours = {}) =>
  DAYS.reduce((result, day) => {
    result[day.key] = {
      ...defaultDay,
      ...(hours?.[day.key] || {}),
    };

    return result;
  }, {});

export default function WorkingHoursCard({ hours = {}, onSave }) {
  const [form, setForm] = useState(() => normalizeHours(hours));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(normalizeHours(hours));
  }, [hours]);

  const updateDay = (key, patch) => {
    setForm((current) => ({
      ...current,
      [key]: {
        ...current[key],
        ...patch,
      },
    }));
  };

  const saveHours = async () => {
    setSaving(true);
    try {
      await onSave?.(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Working Hours</h3>
        <button
          type="button"
          onClick={saveHours}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => {
          const value = form[day.key] || defaultDay;

          return (
            <div
              key={day.key}
              className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm sm:grid-cols-[110px_90px_1fr_1fr]"
            >
              <span className="font-semibold text-slate-700">{day.label}</span>

              <label className="flex items-center gap-2 font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={value.open}
                  onChange={(event) =>
                    updateDay(day.key, { open: event.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Open
              </label>

              <input
                type="time"
                value={value.opens || ""}
                disabled={!value.open}
                onChange={(event) =>
                  updateDay(day.key, { opens: event.target.value })
                }
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
              />

              <input
                type="time"
                value={value.closes || ""}
                disabled={!value.open}
                onChange={(event) =>
                  updateDay(day.key, { closes: event.target.value })
                }
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

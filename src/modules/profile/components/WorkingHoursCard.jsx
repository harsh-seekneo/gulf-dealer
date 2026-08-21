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
    result[day.key] = { ...defaultDay, ...(hours?.[day.key] || {}) };
    return result;
  }, {});

export default function WorkingHoursEditable({ hours = {}, onSave }) {
  const [form, setForm] = useState(() => normalizeHours(hours));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(normalizeHours(hours));
  }, [hours]);

  const updateDay = (key, patch) => {
    setForm((current) => ({
      ...current,
      [key]: { ...current[key], ...patch },
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
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Working Hours</h3>
        <button
          type="button"
          onClick={saveHours}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="mt-3 border-t border-slate-100">
        {DAYS.map((day) => {
          const value = form[day.key] || defaultDay;

          return (
            <div
              key={day.key}
              className="flex flex-wrap items-center justify-between gap-3 py-3.5 border-b border-slate-50 last:border-b-0"
            >
              <label className="flex items-center gap-2 min-w-[140px]">
                <input
                  type="checkbox"
                  checked={value.open}
                  onChange={(event) =>
                    updateDay(day.key, { open: event.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-slate-700">{day.label}</span>
              </label>

              {value.open ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={value.opens}
                    onChange={(event) =>
                      updateDay(day.key, { opens: event.target.value })
                    }
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-900 focus:border-blue-400 focus:outline-none"
                  />
                  <span className="text-slate-400">&ndash;</span>
                  <input
                    type="time"
                    value={value.closes}
                    onChange={(event) =>
                      updateDay(day.key, { closes: event.target.value })
                    }
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-900 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              ) : (
                <span className="font-semibold text-red-500">Closed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
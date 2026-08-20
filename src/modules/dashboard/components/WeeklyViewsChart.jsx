//[DEALER] /Users/personal/Desktop/gulf--dealer/gulf-dealer/src/modules/dashboard/components/WeeklyViewsChart.jsx

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

const DEFAULT_WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const RANGE_OPTIONS = [
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

// Fixed Y-axis scale for both Week and Month
const CHART_MAX = 1000;

const Y_AXIS_VALUES = [1000, 750, 500, 250, 0];

function fallbackData(range) {
  if (range === "month") {
    return ["Week 1", "Week 2", "Week 3", "Week 4"].map((day) => ({
      day,
      views: 0,
    }));
  }

  return DEFAULT_WEEK_DAYS.map((day) => ({
    day,
    views: 0,
  }));
}

export default function WeeklyViewsChart({
  data,
  weeklyData,
  monthlyData,
  defaultRange = "week",
  title = "Average Listing Views",
  loading = false,
  onRangeChange,
}) {
  const [range, setRange] = useState(defaultRange);
  const [menuOpen, setMenuOpen] = useState(false);

  // Legacy `data` prop is treated as weekly data
  const resolvedWeekly = weeklyData ?? data;

  const activeData = useMemo(() => {
    const source = range === "month" ? monthlyData : resolvedWeekly;

    return source && source.length ? source : fallbackData(range);
  }, [range, resolvedWeekly, monthlyData]);

  const hasData = activeData.some((d) => (Number(d.views) || 0) > 0);

  const handleSelectRange = (key) => {
    setRange(key);
    setMenuOpen(false);
    onRangeChange?.(key);
  };

  const activeLabel =
    RANGE_OPTIONS.find((o) => o.key === range)?.label ?? "This Week";

  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 sm:text-lg">
          {title}
        </h3>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            {activeLabel}
            <ChevronDown size={12} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />

              <div className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-lg">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectRange(opt.key)}
                    className={`block w-full px-3 py-2 text-left text-xs font-medium hover:bg-slate-50 ${
                      opt.key === range
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-36 items-center justify-center text-sm text-slate-400 sm:h-44">
          Loading chart data…
        </div>
      ) : (
        <div className="flex overflow-x-auto">
          {/* =========================
              Y AXIS
          ========================== */}
          <div className="mr-3 flex h-36 shrink-0 flex-col justify-between text-xs text-slate-400 sm:h-44">
            {Y_AXIS_VALUES.map((value) => (
              <span key={value} className="leading-none">
                {value.toLocaleString()}
              </span>
            ))}
          </div>

          {/* =========================
              CHART AREA
          ========================== */}
          <div className="relative min-w-[420px] flex-1">
            {/* Gridlines */}
            <div className="absolute inset-0 flex h-36 flex-col justify-between sm:h-44">
              {Y_AXIS_VALUES.map((value) => (
                <div
                  key={value}
                  className="border-t border-dashed border-slate-300"
                />
              ))}
            </div>

            {/* =========================
                BARS
            ========================== */}
            <div className="relative flex h-36 items-end justify-between gap-3 px-2 sm:h-44 sm:gap-4">
              {activeData.map((d) => {
                const views = Math.max(0, Number(d.views) || 0);

                /*
                 * Both Week and Month use the same
                 * 0 - 1000 scale.
                 */
                const heightPct =
                  CHART_MAX > 0
                    ? Math.min((views / CHART_MAX) * 100, 100)
                    : 0;

                return (
                  <div
                    key={d.day}
                    className="group relative flex h-full flex-1 flex-col items-center justify-end"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-6 whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {views.toLocaleString()}
                    </div>

                    {/* Bar */}
                    <div
                      className="w-6 rounded-t-md bg-blue-600 transition-all duration-300 ease-out hover:bg-blue-700 sm:w-10"
                      style={{
                        height: `${heightPct}%`,
                        minHeight: views > 0 ? 4 : 0,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis line */}
            <div className="mt-1 border-t border-slate-200" />

            {/* X-axis labels */}
            <div className="mt-2 flex justify-between gap-3 px-2 sm:gap-4">
              {activeData.map((d) => (
                <div
                  key={d.day}
                  className="flex-1 text-center text-xs text-slate-500"
                >
                  {d.day}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No data message */}
      {!loading && !hasData && (
        <p className="mt-3 text-center text-xs text-slate-400">
          No views recorded for this period yet.
        </p>
      )}
    </div>
  );
}
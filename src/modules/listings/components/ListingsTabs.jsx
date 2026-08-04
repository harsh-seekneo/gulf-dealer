import { LISTING_TABS } from "../listings.constants";

export default function ListingsTabs({ activeTab, onChange, statusCounts }) {
  return (
    <div className="flex rounded-xl bg-white p-1 shadow-sm">
      {LISTING_TABS.map((tab) => {
        const count = statusCounts?.[tab.key] ?? 0;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
            {count > 0 && (
              <span
                className={`ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                  activeTab === tab.key
                    ? "bg-white text-blue-600"
                    : tab.key === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : tab.key === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
import { LISTING_TABS } from "../listings.constants";

export default function ListingsTabs({ activeTab, onChange, totalCount }) {
  return (
    <div className="flex rounded-xl bg-white p-1 shadow-sm">
      {LISTING_TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
            activeTab === tab.key
              ? "bg-blue-600 text-white"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {tab.label}
          {tab.key === "all" && ` (${totalCount})`}
        </button>
      ))}
    </div>
  );
}
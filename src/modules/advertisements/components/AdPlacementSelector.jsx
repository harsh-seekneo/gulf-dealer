import { LayoutGrid, FileText, Layers, Tag, Check } from "lucide-react";

const PLACEMENTS = [
  { key: "homepage_banner", label: "Homepage Banner", desc: "Top placement — highest visibility", icon: LayoutGrid },
  { key: "listing_page_banner", label: "Listing Page Banner", desc: "Shown inside listing detail pages", icon: FileText },
  { key: "large_category_ad", label: "Large Category Ad", desc: "Category & search result pages", icon: Layers },
  { key: "small_ad_space", label: "Small Ad Space", desc: "Sidebar & inline card slots", icon: Tag },
];

export default function AdPlacementSelector({ selected }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-4 text-lg font-bold">Advertisement Placement</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PLACEMENTS.map((p) => {
          const Icon = p.icon;
          const isSelected = selected === p.key;
          return (
            <div
              key={p.key}
              className={`relative flex items-start gap-3 rounded-xl border p-4 ${
                isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200"
              }`}
            >
              {isSelected && (
                <span className="absolute right-3 top-3 rounded-full bg-blue-600 p-0.5 text-white">
                  <Check size={12} />
                </span>
              )}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Icon size={18} className="text-slate-500" />
              </div>
              <div>
                <p className={`font-semibold ${isSelected ? "text-blue-700" : "text-slate-900"}`}>
                  {p.label}
                </p>
                <p className="text-xs text-slate-400">{p.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
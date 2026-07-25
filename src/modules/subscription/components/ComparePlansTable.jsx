import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Check } from "lucide-react";

export default function ComparePlansTable({ rows, columns }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-5 py-4 text-left text-sm font-semibold"
      >
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
        Compare Plans
      </button>

      {open && (
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Feature</th>
                {columns.map((c) => (
                  <th key={c} className="px-5 py-3 font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.feature}>
                  <td className="px-5 py-3 font-medium">{row.feature}</td>
                  {columns.map((c) => (
                    <td key={c} className="px-5 py-3">
                      {row[c] === true ? (
                        <Check size={16} className="text-emerald-500" />
                      ) : row[c] === false || row[c] == null ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        row[c]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
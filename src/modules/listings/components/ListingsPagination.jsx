//[DEALER] /Users/personal/Desktop/gulf--dealer/gulf-dealer/src/modules/listings/components/ListingsPagination.jsx

import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageNumbers(currentPage, totalPages) {
  // Always show first, last, current, and one neighbor on each side.
  // Collapse gaps into "..." markers.
  const pages = [];

  const addPage = (p) => {
    if (!pages.includes(p)) pages.push(p);
  };

  addPage(1);

  for (let p = currentPage - 1; p <= currentPage + 1; p++) {
    if (p > 1 && p < totalPages) addPage(p);
  }

  if (totalPages > 1) addPage(totalPages);

  const withGaps = [];
  let prev = null;

  for (const p of pages.sort((a, b) => a - b)) {
    if (prev !== null && p - prev > 1) {
      withGaps.push("gap");
    }
    withGaps.push(p);
    prev = p;
  }

  return withGaps;
}

export default function ListingsPagination({
  page = 1,
  limit = 10,
  totalItems = 0,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  if (totalItems === 0) return null;

  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, totalItems);

  const pageNumbers = getPageNumbers(page, totalPages);

  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange?.(p);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-4">
      <p className="text-sm text-slate-500">
        Showing {rangeStart}–{rangeEnd} of {totalItems} listings
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((p, i) =>
          p === "gap" ? (
            <span
              key={`gap-${i}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-slate-400"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition ${
                p === page
                  ? "bg-blue-700 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
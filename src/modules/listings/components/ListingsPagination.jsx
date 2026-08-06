import { ChevronLeft, ChevronRight } from "lucide-react";

const ListingsPagination = ({ page, limit, totalItems, onPageChange }) => {
  if (totalItems === 0) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
      <p className="text-sm text-slate-500">
        Showing {startItem}-{endItem} out of {totalItems} listings
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ListingsPagination;
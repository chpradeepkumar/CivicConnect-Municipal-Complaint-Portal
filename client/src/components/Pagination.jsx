import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = meta;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = [];
  const add = (p) => {
    if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p);
  };
  add(1);
  for (let p = page - 1; p <= page + 1; p += 1) add(p);
  add(totalPages);
  pages.sort((a, b) => a - b);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-navy-100 px-4 py-3 sm:flex-row">
      <p className="text-sm text-navy-500">
        Showing <span className="font-semibold text-navy-700">{start}</span>–
        <span className="font-semibold text-navy-700">{end}</span> of{' '}
        <span className="font-semibold text-navy-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          className="btn-ghost px-2 py-1.5"
          onClick={() => onPageChange(page - 1)}
          disabled={!meta.hasPrevPage}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, idx) => {
          const prev = pages[idx - 1];
          return (
            <span key={p} className="flex items-center">
              {prev && p - prev > 1 ? <span className="px-1 text-navy-400">…</span> : null}
              <button
                onClick={() => onPageChange(p)}
                className={`min-w-[2rem] rounded-md px-2.5 py-1.5 text-sm font-semibold ${
                  p === page ? 'bg-civic-700 text-white' : 'text-navy-600 hover:bg-navy-50'
                }`}
              >
                {p}
              </button>
            </span>
          );
        })}
        <button
          className="btn-ghost px-2 py-1.5"
          onClick={() => onPageChange(page + 1)}
          disabled={!meta.hasNextPage}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;

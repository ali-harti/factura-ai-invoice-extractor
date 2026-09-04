import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 20,
  onPageChange
}) {
  if (totalItems === 0) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipses (up to 5 page numbers shown)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-sm text-foreground/60 transition-colors">
      {/* Summary label */}
      <div className="text-xs sm:text-sm">
        Affichage de <span className="font-semibold text-foreground">{startIdx}</span> à{' '}
        <span className="font-semibold text-foreground">{endIdx}</span> sur{' '}
        <span className="font-semibold text-foreground">{totalItems}</span> factures
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-foreground/5 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
          aria-label="Page précédente"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((item, idx) => {
            if (item === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 text-foreground/40 select-none">
                  ...
                </span>
              );
            }

            const isActive = item === currentPage;
            return (
              <button
                key={`page-${item}`}
                type="button"
                onClick={() => onPageChange(item)}
                className={`min-w-[34px] h-[34px] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center ${
                  isActive
                    ? 'bg-[#E8724A] text-white shadow-sm'
                    : 'border border-border bg-card text-foreground hover:bg-foreground/5 shadow-sm'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-foreground/5 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
          aria-label="Page suivante"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

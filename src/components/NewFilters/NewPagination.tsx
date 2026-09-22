import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function NewPagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = currentPage - 1;
      let end = currentPage + 1;

      if (currentPage <= 4) {
        start = 2;
        end = 5;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
        end = totalPages - 1;
      }

      // Add left ellipsis if there is a gap between 1 and start
      if (start > 2) {
        pages.push("...");
      }

      // Add range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add right ellipsis if there is a gap between end and totalPages
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always include the last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className="flex items-center gap-6 md:gap-8 select-none"
      id="custom-pagination"
    >
      {/* Previous Page Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-1 py-2 text-sm font-medium text-[#475467] hover:text-[#101828] disabled:opacity-30 disabled:pointer-events-none transition-colors group cursor-pointer"
        id="pagination-prev"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="w-4 h-4 text-[#475467] group-hover:text-[#101828] transition-colors stroke-[2]" />
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div
        className="flex items-center gap-1.5 md:gap-3"
        id="pagination-numbers"
      >
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-sm text-[#98A2B3] font-medium"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isSelected = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              aria-current={isSelected ? "page" : undefined}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all cursor-pointer ${
                isSelected
                  ? "border border-[#3B82F6] text-[#3B82F6] hover:bg-[#EFF6FF]"
                  : "text-[#475467] hover:bg-[#F2F4F7] hover:text-[#101828]"
              }`}
              id={`pagination-page-${pageNum}`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Page Button */}
      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-1 py-2 text-sm font-medium text-[#475467] hover:text-[#101828] disabled:opacity-30 disabled:pointer-events-none transition-colors group cursor-pointer"
        id="pagination-next"
        aria-label="Go to next page"
      >
        <span>Next</span>
        <ChevronRight className="w-4 h-4 text-[#475467] group-hover:text-[#101828] transition-colors stroke-[2]" />
      </button>
    </div>
  );
}

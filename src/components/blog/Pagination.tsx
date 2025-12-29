"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export const Pagination = ({ totalPages, currentPage }: PaginationProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`/blog?${params.toString()}`, { scroll: true });
    });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first 4 pages
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if there are pages between 4 and last
      if (totalPages > 5) {
        pages.push("...");
      }
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous button */}
      {currentPage > 1 && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isPending}
          className="px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
      )}

      {/* Page numbers */}
      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-neutral-500">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            disabled={isPending || isActive}
            className={`px-4 py-2 rounded-lg border transition-colors disabled:cursor-not-allowed ${
              isActive
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-neutral-300 hover:bg-neutral-100 disabled:opacity-50"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next button */}
      {currentPage < totalPages && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isPending}
          className="px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      )}
    </div>
  );
};


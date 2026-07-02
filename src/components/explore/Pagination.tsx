"use client";

import { useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

export const LIST_PAGE_SIZE = 24;

export function usePagination<T>(items: T[], pageSize = LIST_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [prevItems, setPrevItems] = useState(items);

  // A new result set (filters or search changed) restarts at page one.
  if (items !== prevItems) {
    setPrevItems(items);
    setPage(1);
  }

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), pageCount));
  };

  return {
    page: safePage,
    pageCount,
    pageItems,
    total: items.length,
    rangeStart: items.length === 0 ? 0 : start + 1,
    rangeEnd: start + pageItems.length,
    goToPage,
  };
}

function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const middle = new Set([current - 1, current, current + 1]);
  const pages: (number | "gap")[] = [1];
  if (current > 3) pages.push("gap");
  for (let i = 2; i < total; i++) {
    if (middle.has(i)) pages.push(i);
  }
  if (current < total - 2) pages.push("gap");
  pages.push(total);
  return pages;
}

export function Pagination({
  page,
  pageCount,
  total,
  rangeStart,
  rangeEnd,
  onPageChange,
  itemsLabel = "results",
}: {
  page: number;
  pageCount: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  itemsLabel?: string;
}) {
  if (total === 0) return null;

  const buttonBase =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center gap-3 border-t border-border px-4 py-6"
    >
      <p className="text-sm font-medium text-ink-muted">
        Showing {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} of{" "}
        {total.toLocaleString()} {itemsLabel}
      </p>

      {pageCount > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className={`${buttonBase} border border-border text-ink-secondary hover:border-border-strong hover:bg-surface-muted hover:text-ink`}
          >
            <CaretLeft size={16} weight="bold" />
          </button>

          {pageNumbers(page, pageCount).map((entry, index) =>
            entry === "gap" ? (
              <span
                key={`gap-${index}`}
                className="px-1 text-sm font-medium text-ink-muted"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => onPageChange(entry)}
                aria-current={entry === page ? "page" : undefined}
                className={`${buttonBase} ${
                  entry === page
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "border border-border text-ink-secondary hover:border-border-strong hover:bg-surface-muted hover:text-ink"
                }`}
              >
                {entry}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
            className={`${buttonBase} border border-border text-ink-secondary hover:border-border-strong hover:bg-surface-muted hover:text-ink`}
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      )}
    </nav>
  );
}

"use client";

import type { DirectoryEntry } from "@/lib/directory";
import { PlaceCard } from "./PlaceCard";
import { TeacherCard } from "./TeacherCard";
import { useRef } from "react";
import { Pagination, usePagination } from "./Pagination";

interface DirectoryListProps {
  entries: DirectoryEntry[];
}

export function DirectoryList({ entries }: DirectoryListProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const pagination = usePagination(entries);

  if (entries.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-ink">
          Nothing found
        </p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Try a different search or clear your filters to see more locations
          and people.
        </p>
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-4">
      <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
        {pagination.pageItems.map((entry, index) =>
          entry.kind === "place" ? (
            <PlaceCard
              key={`place-${entry.id}`}
              place={entry.data}
              index={index}
              showKindBadge
            />
          ) : (
            <TeacherCard
              key={`teacher-${entry.id}`}
              teacher={entry.data}
              index={index}
              showKindBadge
            />
          ),
        )}
      </div>
      <Pagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        total={pagination.total}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        onPageChange={(next) => {
          pagination.goToPage(next);
          topRef.current?.scrollIntoView({ block: "start" });
        }}
        itemsLabel="results"
      />
    </div>
  );
}

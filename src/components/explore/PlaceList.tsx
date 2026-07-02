"use client";

import type { Place } from "@/types/place";
import { PlaceCard } from "./PlaceCard";
import { useRef } from "react";
import { Pagination, usePagination } from "./Pagination";

interface PlaceListProps {
  places: Place[];
}

export function PlaceList({ places }: PlaceListProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const pagination = usePagination(places);

  if (places.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-ink">
          No places found
        </p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Try a different search or clear your filters to see more centers and
          temples.
        </p>
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-4">
      <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
        {pagination.pageItems.map((place, index) => (
          <PlaceCard key={place.id} place={place} index={index} />
        ))}
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
        itemsLabel="locations"
      />
    </div>
  );
}

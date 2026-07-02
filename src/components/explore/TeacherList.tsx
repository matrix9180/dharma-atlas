"use client";

import type { Teacher } from "@/types/teacher";
import { TeacherCard } from "./TeacherCard";
import { useRef } from "react";
import { Pagination, usePagination } from "./Pagination";

interface TeacherListProps {
  teachers: Teacher[];
  variant?: "default" | "tile";
}

export function TeacherList({ teachers, variant = "default" }: TeacherListProps) {
  const isTile = variant === "tile";
  const compact = isTile;
  const topRef = useRef<HTMLDivElement>(null);
  const pagination = usePagination(teachers);

  if (teachers.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center px-6 py-20 text-center ${
          isTile ? "" : "min-h-0 flex-1"
        }`}
      >
        <p className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-ink">
          No people found
        </p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Try a different search or clear your filters to see more profiles.
        </p>
      </div>
    );
  }

  return (
    <div ref={topRef} className={isTile ? "scroll-mt-4 py-6" : "scroll-mt-4"}>
      <div
        className={
          isTile
            ? "grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
            : "grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6"
        }
      >
        {pagination.pageItems.map((teacher, index) => (
          <TeacherCard
            key={teacher.slug}
            teacher={teacher}
            index={index}
            compact={compact}
          />
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
        itemsLabel="people"
      />
    </div>
  );
}

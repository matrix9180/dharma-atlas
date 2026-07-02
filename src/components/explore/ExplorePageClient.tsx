"use client";

import { useMemo } from "react";
import { ExploreNav } from "@/components/layout/SiteHeader";
import { buildDirectoryEntries } from "@/lib/directory";
import { useExploreStore, type EntityFilter } from "@/store/explore-store";
import { useExploreRouteSync } from "@/hooks/useExploreRouteSync";
import type { Place } from "@/types/place";
import type { Teacher } from "@/types/teacher";
import { DirectoryList } from "./DirectoryList";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AllFeaturePage } from "./AllFeaturePage";
import { FilterBar, useActiveFilterCount } from "./FilterBar";
import { PlaceList } from "./PlaceList";
import { TeacherList } from "./TeacherList";

function FilterSidebar({
  entityFilter,
  filtersOpen,
  onClose,
  places,
  teachers,
}: {
  entityFilter: EntityFilter;
  filtersOpen: boolean;
  onClose: () => void;
  places: Place[];
  teachers: Teacher[];
}) {
  return (
    <>
      {filtersOpen && (
        <button
          type="button"
          aria-label="Close filters"
          className="absolute inset-0 z-10 bg-ink/20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`flex shrink-0 flex-col overflow-hidden border-r border-border bg-surface-elevated transition-[width,transform] duration-200 ease-out max-lg:absolute max-lg:inset-y-0 max-lg:left-0 max-lg:z-20 max-lg:w-[min(100%,18rem)] max-lg:shadow-[var(--shadow-card)] lg:relative lg:z-auto ${
          filtersOpen
            ? "max-lg:translate-x-0 lg:w-80"
            : "max-lg:pointer-events-none max-lg:-translate-x-full lg:w-0 lg:border-r-0"
        }`}
        aria-hidden={!filtersOpen}
      >
        <FilterBar
          places={places}
          teachers={teachers}
          entityFilter={entityFilter}
          onClose={onClose}
        />
      </aside>
    </>
  );
}

export function ExplorePageClient({
  places,
  teachers,
}: {
  places: Place[];
  teachers: Teacher[];
}) {
  useExploreRouteSync();

  const entityFilter = useExploreStore((s) => s.entityFilter);
  const query = useExploreStore((s) => s.query);
  const traditions = useExploreStore((s) => s.traditions);
  const schools = useExploreStore((s) => s.schools);
  const types = useExploreStore((s) => s.types);
  const faiths = useExploreStore((s) => s.faiths);
  const filtersOpen = useExploreStore((s) => s.filtersOpen);
  const toggleFilters = useExploreStore((s) => s.toggleFilters);
  const activeFilterCount = useActiveFilterCount();

  const placeFilters = useMemo(
    () => ({ query, traditions, schools, types, faiths }),
    [query, traditions, schools, types, faiths],
  );
  const teacherFilters = useMemo(
    () => ({ query, traditions, schools }),
    [query, traditions, schools],
  );

  const directoryEntries = useMemo(
    () =>
      buildDirectoryEntries(
        places,
        teachers,
        entityFilter,
        placeFilters,
        teacherFilters,
      ),
    [places, teachers, entityFilter, placeFilters, teacherFilters],
  );

  const filteredPlaces = useMemo(
    () => directoryEntries.filter((e) => e.kind === "place").map((e) => e.data),
    [directoryEntries],
  );

  const filteredTeachers = useMemo(
    () =>
      directoryEntries.filter((e) => e.kind === "teacher").map((e) => e.data),
    [directoryEntries],
  );

  const isPeopleBrowse = entityFilter === "people";
  const isAllBrowse = entityFilter === "all";
  const hasActiveBrowse =
    query.trim().length > 0 ||
    traditions.length > 0 ||
    schools.length > 0 ||
    types.length > 0 ||
    faiths.length > 0;
  const showAllFeature = isAllBrowse && !hasActiveBrowse;

  const listContent =
    isAllBrowse ? (
      hasActiveBrowse ? (
        <DirectoryList entries={directoryEntries} />
      ) : null
    ) : isPeopleBrowse ? (
      <TeacherList teachers={filteredTeachers} variant="tile" />
    ) : (
      <PlaceList places={filteredPlaces} />
    );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface">
      <ExploreNav activeFilterCount={activeFilterCount} />

      <div className="relative flex min-h-0 flex-1">
        <FilterSidebar
          entityFilter={entityFilter}
          filtersOpen={filtersOpen}
          onClose={toggleFilters}
          places={places}
          teachers={teachers}
        />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="flex-1">
            {showAllFeature ? (
              <AllFeaturePage places={places} teachers={teachers} />
            ) : isPeopleBrowse ? (
              <div className="mx-auto w-full max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8">
                {listContent}
              </div>
            ) : (
              <div className="mx-auto w-full max-w-[1600px]">{listContent}</div>
            )}
          </div>
          <SiteFooter />
        </main>
      </div>
    </div>
  );
}

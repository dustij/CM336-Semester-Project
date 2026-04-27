'use client';

import { ExerciseFilterDialog } from '@/components/core/exercises/ExerciseFilterDialog';
import { ExerciseList } from '@/components/core/exercises/ExerciseList';
import { ExerciseListSkeleton } from '@/components/core/exercises/ExerciseListSkeleton';
import type {
  ExerciseCatalogFilters,
  ExerciseCatalogPage,
  ExerciseFilterOptions,
} from '@/lib/core/types';
import { useState } from 'react';

type ExerciseCatalogClientProps = {
  filters: ExerciseCatalogFilters;
  filterOptions: ExerciseFilterOptions;
  initialPage: ExerciseCatalogPage;
};

export function ExerciseCatalogClient({
  filters,
  filterOptions,
  initialPage,
}: ExerciseCatalogClientProps) {
  const listKey = [filters.q, filters.equipment, filters.muscleGroup].join('|');
  const [loadingListKey, setLoadingListKey] = useState<string | null>(null);
  const loadingFilters = loadingListKey === listKey;

  return (
    <main className="bg-my-background flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="bg-my-background shrink-0 px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <p className="text-[18px] leading-7 font-semibold tracking-[-0.02em] text-gray-950">
            Exercises
          </p>
          <ExerciseFilterDialog
            filters={filters}
            filterOptions={filterOptions}
            onNavigateStart={() => setLoadingListKey(listKey)}
          />
        </div>
      </div>

      {loadingFilters ? (
        <ExerciseListSkeleton />
      ) : (
        <ExerciseList
          key={listKey}
          filters={filters}
          initialPage={initialPage}
        />
      )}
    </main>
  );
}

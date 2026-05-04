'use client';

import type {
  ExerciseCatalogFilters,
  ExerciseCatalogPage,
  ExerciseFilterOptions,
} from '@/lib/core/types';
import { useState } from 'react';
import { ExerciseFilterDialog } from './ExerciseFilterDialog';
import { ExerciseList } from './ExerciseList';
import { ExerciseListSkeleton } from './ExerciseListSkeleton';

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
      <div className="border-b-border flex w-full items-center border-b px-5 py-3.5">
        <div className="flex-1">
          <p className="text-body flex h-9 items-center text-lg font-semibold">
            Exercises
          </p>
        </div>
        <ExerciseFilterDialog
          filters={filters}
          filterOptions={filterOptions}
          onNavigateStart={() => setLoadingListKey(listKey)}
        />
      </div>
      <div className="flex min-h-0 flex-col overflow-hidden overflow-y-auto">
        {loadingFilters ? (
          <ExerciseListSkeleton />
        ) : (
          <ExerciseList
            key={listKey}
            filters={filters}
            initialPage={initialPage}
          />
        )}
      </div>
    </main>

    // <main className="bg-my-background flex min-h-0 flex-1 flex-col overflow-hidden">
    //   <div className="bg-my-background shrink-0 px-5 pt-6 pb-2">
    //     <div className="flex items-center justify-between">
    //       <p className="text-body text-lg font-semibold">Exercises</p>
    //       <ExerciseFilterDialog
    //         filters={filters}
    //         filterOptions={filterOptions}
    //         onNavigateStart={() => setLoadingListKey(listKey)}
    //       />
    //     </div>
    //   </div>

    //   {loadingFilters ? (
    //     <ExerciseListSkeleton />
    //   ) : (
    //     <ExerciseList
    //       key={listKey}
    //       filters={filters}
    //       initialPage={initialPage}
    //     />
    //   )}
    // </main>
  );
}

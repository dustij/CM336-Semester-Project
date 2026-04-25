import { ExerciseFilterDialog } from '@/components/core/exercises/ExerciseFilterDialog';
import { ExerciseList } from '@/components/core/exercises/ExerciseList';
import {
  EXERCISE_CATALOG_PAGE_SIZE,
  getExerciseCatalogPage,
  getExerciseFilterOptions,
} from '@/db/repository/repository';
import type { ExerciseCatalogFilters } from '@/lib/core/types';

type ExercisesPageProps = {
  filters: ExerciseCatalogFilters;
};

export default async function ExercisesPage({ filters }: ExercisesPageProps) {
  const [exercisePage, filterOptions] = await Promise.all([
    getExerciseCatalogPage(filters, {
      limit: EXERCISE_CATALOG_PAGE_SIZE,
      offset: 0,
    }),
    getExerciseFilterOptions(),
  ]);
  const listKey = [filters.q, filters.equipment, filters.muscleGroup].join('|');

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
          />
        </div>
      </div>

      <ExerciseList
        key={listKey}
        filters={filters}
        initialPage={exercisePage}
      />
    </main>
  );
}

import { ExerciseCatalogClient } from '@/components/core/exercises/ExerciseCatalogClient';
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

  return (
    <ExerciseCatalogClient
      filters={filters}
      filterOptions={filterOptions}
      initialPage={exercisePage}
    />
  );
}

import ExercisesPage from '@/components/core/exercises/ExercisesPage';
import type { ExerciseCatalogFilters } from '@/lib/core/types';

type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

function getSingleParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const trimmedValue = rawValue?.trim();
  return trimmedValue || undefined;
}

export default async function Exercises({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters: ExerciseCatalogFilters = {
    q: getSingleParam(params.q),
    equipment: getSingleParam(params.equipment),
    muscleGroup: getSingleParam(params.muscleGroup),
  };

  return <ExercisesPage filters={filters} />;
}

import {
  EXERCISE_CATALOG_PAGE_SIZE,
  getExerciseCatalogPage,
} from '@/db/repository/exercise_repository';
import type { ExerciseCatalogFilters } from '@/lib/core/types';
import type { NextRequest } from 'next/server';

function getStringParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key)?.trim();
  return value || undefined;
}

function getNumberParam(
  searchParams: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number
) {
  const rawValue = searchParams.get(key);

  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filters: ExerciseCatalogFilters = {
    q: getStringParam(searchParams, 'q'),
    equipment: getStringParam(searchParams, 'equipment'),
    muscleGroup: getStringParam(searchParams, 'muscleGroup'),
  };
  const limit = getNumberParam(
    searchParams,
    'limit',
    EXERCISE_CATALOG_PAGE_SIZE,
    1,
    100
  );
  const offset = getNumberParam(searchParams, 'offset', 0, 0, 100000);
  const page = await getExerciseCatalogPage(filters, { limit, offset });

  return Response.json(page);
}

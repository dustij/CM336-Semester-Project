import 'server-only';

import * as db from '@/db/server/db';
import {
  buildSelectExerciseCatalogQuery,
  selectExerciseEquipmentOptions,
  selectExerciseMuscleGroupOptions,
} from '@/db/sql/ts/exercise/query';
import type {
  ExerciseCatalogFilters,
  ExerciseCatalogListItem,
  ExerciseFilterOptions,
  ExerciseListItem,
  ExercisesByMuscleGroup,
  MesocycleListItem,
} from '@/lib/core/types';
import { RowDataPacket } from 'mysql2';
import { cacheLife, cacheTag } from 'next/cache';

type ExerciseCatalogRow = RowDataPacket & {
  id: number;
  name: string;
  equipment: string | null;
  muscleGroup: string | null;
};

type ExerciseFilterOptionRow = RowDataPacket & {
  name: string;
};

const EXERCISE_CATALOG_FALLBACK: ExerciseCatalogListItem[] = [
  {
    id: 1,
    name: 'Barbell Bench Press',
    equipment: 'Barbell',
    muscleGroup: 'Chest',
  },
  {
    id: 2,
    name: 'Barbell Curl',
    equipment: 'Barbell',
    muscleGroup: 'Upper Arms',
  },
];

function getFallbackExerciseFilterOptions(): ExerciseFilterOptions {
  return {
    equipment: Array.from(
      new Set(EXERCISE_CATALOG_FALLBACK.map((exercise) => exercise.equipment))
    ).sort(),
    muscleGroups: Array.from(
      new Set(EXERCISE_CATALOG_FALLBACK.map((exercise) => exercise.muscleGroup))
    ).sort(),
  };
}

function filterFallbackExerciseCatalog(
  filters: ExerciseCatalogFilters = {}
): ExerciseCatalogListItem[] {
  const query = filters.q?.toLowerCase();

  return EXERCISE_CATALOG_FALLBACK.filter((exercise) => {
    if (query && !exercise.name.toLowerCase().includes(query)) {
      return false;
    }

    if (filters.equipment && exercise.equipment !== filters.equipment) {
      return false;
    }

    if (filters.muscleGroup && exercise.muscleGroup !== filters.muscleGroup) {
      return false;
    }

    return true;
  });
}

function hasDatabaseConfig() {
  return Boolean(process.env['MYSQL_URI']);
}

export async function getCurrentMesocycle(userId: number) {
  'use cache';
  cacheTag(`mesocycles:user:${userId}`);
  cacheLife('max'); // max because we manually invalidate after user selects a mesocycle as current
  return null;
}

export async function getMesocycleList(
  userId: number
): Promise<MesocycleListItem[]> {
  'use cache';
  cacheTag(`mesocycles:user:${userId}`);
  cacheLife('max'); // max because we manually invalidate after user adds a new mesocycle
  return [];
}

export async function getMuscleGroupList() {
  'use cache';
  cacheTag(`mesocycles:muscleGroups`);
  cacheLife('days'); // days because muscle groups may be updated but not often

  return ['Chest', 'Back'];
}

export async function getExerciseListByMuscleGroup(
  muscleGroup: string
): Promise<ExerciseListItem[]> {
  'use cache';
  // When we add feature user-created exercises, we will need to manually invalidate
  cacheTag(`mesocycles:exercisesByMuscleGroup:${muscleGroup}`);
  cacheLife('days'); // days because exercises may be updated but not often (IMPORTANT: we may need to change this later)
  return [{ id: 0, name: 'Bench Press (incline)', equipment: 'Barbell' }];
}

export async function getExerciseListsByMuscleGroup(
  muscleGroups: string[]
): Promise<ExercisesByMuscleGroup> {
  const exerciseEntries = await Promise.all(
    muscleGroups.map(async (muscleGroup) => [
      muscleGroup,
      await getExerciseListByMuscleGroup(muscleGroup),
    ])
  );

  return Object.fromEntries(exerciseEntries);
}

export async function getExerciseCatalog(
  filters: ExerciseCatalogFilters = {}
): Promise<ExerciseCatalogListItem[]> {
  'use cache';
  cacheTag('exercises:list');
  cacheLife('days');

  if (!hasDatabaseConfig()) {
    return filterFallbackExerciseCatalog(filters);
  }

  try {
    const { sql, values } = buildSelectExerciseCatalogQuery(filters);
    const result = (await db.query(sql, values)) as ExerciseCatalogRow[];

    return result.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      equipment: exercise.equipment ?? 'Unknown',
      muscleGroup: exercise.muscleGroup ?? 'Unknown',
    }));
  } catch (error) {
    console.error('Failed to fetch exercise catalog.', error);
    return filterFallbackExerciseCatalog(filters);
  }
}

export async function getExerciseFilterOptions(): Promise<ExerciseFilterOptions> {
  'use cache';
  cacheTag('exercises:filter-options');
  cacheLife('days');

  if (!hasDatabaseConfig()) {
    return getFallbackExerciseFilterOptions();
  }

  try {
    const [equipmentRows, muscleGroupRows] = (await Promise.all([
      db.query(selectExerciseEquipmentOptions),
      db.query(selectExerciseMuscleGroupOptions),
    ])) as [ExerciseFilterOptionRow[], ExerciseFilterOptionRow[]];

    return {
      equipment: equipmentRows.map((row) => row.name),
      muscleGroups: muscleGroupRows.map((row) => row.name),
    };
  } catch (error) {
    console.error('Failed to fetch exercise filter options.', error);
    return getFallbackExerciseFilterOptions();
  }
}

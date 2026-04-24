import 'server-only';

import * as db from '@/db/server/db';
import { queries } from '@/db/sql-deprecated';
import type {
  ExerciseCatalogListItem,
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

const EXERCISE_CATALOG_FALLBACK: ExerciseCatalogListItem[] = [
  {
    id: 1,
    name: 'Bench Press (Incline)',
    equipment: 'Barbell',
    muscleGroup: 'Chest',
  },
  {
    id: 2,
    name: 'Dumbbell Skullcrusher',
    equipment: 'Dumbbell',
    muscleGroup: 'Triceps',
  },
];

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

export async function getExerciseCatalog(): Promise<ExerciseCatalogListItem[]> {
  'use cache';
  cacheTag('exercises:list');
  cacheLife('days');

  if (!hasDatabaseConfig()) {
    return EXERCISE_CATALOG_FALLBACK;
  }

  try {
    const result = (await db.query(
      queries.selectExerciseCatalog
    )) as ExerciseCatalogRow[];

    return result.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      equipment: exercise.equipment ?? 'Unknown',
      muscleGroup: exercise.muscleGroup ?? 'Unknown',
    }));
  } catch (error) {
    console.error('Failed to fetch exercise catalog.', error);
    return EXERCISE_CATALOG_FALLBACK;
  }
}

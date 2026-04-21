import 'server-only';

import type {
  ExerciseListItem,
  ExercisesByMuscleGroup,
  MesocycleListItem,
} from '@/lib/core/types';
import { cacheLife, cacheTag } from 'next/cache';

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

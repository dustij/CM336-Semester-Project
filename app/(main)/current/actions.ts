'use server';

import { getExerciseListsByMuscleGroup } from '@/db/repository/exercise_repository';
import { getMuscleGroupList } from '@/db/repository/muscle_group_repository';
import type { ExercisesByMuscleGroup } from '@/lib/core/types';
import { verifySession } from '@/lib/session';

export type ReplaceExerciseOptionsActionState = {
  status: 'success' | 'error';
  message?: string;
  muscleGroups: string[];
  exercisesByMuscleGroup: ExercisesByMuscleGroup;
};

export async function getReplaceExerciseOptionsAction(): Promise<ReplaceExerciseOptionsActionState> {
  await verifySession();

  try {
    const muscleGroups = await getMuscleGroupList();
    const exercisesByMuscleGroup =
      await getExerciseListsByMuscleGroup(muscleGroups);

    return {
      status: 'success',
      muscleGroups: muscleGroups.map((muscleGroup) => muscleGroup.name),
      exercisesByMuscleGroup,
    };
  } catch (error) {
    console.error('Failed to load replacement exercise options.', error);

    return {
      status: 'error',
      message: 'Could not load exercises. Please try again.',
      muscleGroups: [],
      exercisesByMuscleGroup: {},
    };
  }
}

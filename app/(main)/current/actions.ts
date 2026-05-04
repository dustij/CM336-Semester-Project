'use server';

import { completeCurrentInstanceDay } from '@/db/repository/current_repository';
import { getExerciseListsByMuscleGroup } from '@/db/repository/exercise_repository';
import { getMuscleGroupList } from '@/db/repository/muscle_group_repository';
import type { FinishCurrentInstanceDayPayload } from '@/components/core/current/state';
import type { ExercisesByMuscleGroup } from '@/lib/core/types';
import { verifySession } from '@/lib/session';
import { updateTag } from 'next/cache';

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

export type CompleteCurrentInstanceDayActionState =
  | {
      status: 'success';
    }
  | {
      status: 'error';
      message: string;
    };

export async function completeCurrentInstanceDayAction(
  payload: FinishCurrentInstanceDayPayload
): Promise<CompleteCurrentInstanceDayActionState> {
  const { userId } = await verifySession();
  const currentInstanceDayId = payload.instanceDay.instanceDayId;

  if (
    !Number.isInteger(currentInstanceDayId) ||
    currentInstanceDayId <= 0 ||
    payload.instanceDay.status !== 'COMPLETED'
  ) {
    return {
      status: 'error',
      message: 'Could not finish the current day.',
    };
  }

  if (
    payload.performedExercises.some(
      (exercise) => exercise.instanceDayId !== currentInstanceDayId
    )
  ) {
    return {
      status: 'error',
      message: 'Could not finish the current day.',
    };
  }

  try {
    await completeCurrentInstanceDay({
      userId,
      currentInstanceDayId,
      status: payload.instanceDay.status,
      performedExercises: payload.performedExercises.map((exercise) => ({
        plannedExerciseId: exercise.plannedExerciseId,
        exerciseId: exercise.exerciseId,
        exerciseOrder: exercise.exerciseOrder,
        repeatUntilMesocycleEnd: exercise.repeatUntilMesocycleEnd,
        status: exercise.status,
        performedSets: exercise.performedSets,
      })),
    });
  } catch (error) {
    console.error('Failed to complete current instance day.', error);

    return {
      status: 'error',
      message: 'Could not finish the current day. Please try again.',
    };
  }

  updateTag(`mesocycles:user:${userId}`);

  return { status: 'success' };
}

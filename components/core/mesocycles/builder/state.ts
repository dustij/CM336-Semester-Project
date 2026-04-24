import type { ExerciseListItem, Weekday } from '@/lib/core/types';

export type PlannedExerciseDraft = ExerciseListItem & {
  exerciseOrder: number;
  exerciseType: string;
  muscleGroup: string;
};

export type MesocycleDayDraft = {
  dayOfWeek: Weekday | null;
  dayOrder: number;
  plannedExercises: PlannedExerciseDraft[];
};

export function addMuscleGroupToDay(
  mesocycleDays: MesocycleDayDraft[],
  dayIndex: number,
  muscleGroup: string
) {
  return mesocycleDays.map((day, index) => {
    if (index !== dayIndex) {
      return day;
    }

    return {
      ...day,
      plannedExercises: [
        ...day.plannedExercises,
        {
          id: 0,
          name: muscleGroup,
          equipment: '',
          exerciseOrder: day.plannedExercises.length,
          exerciseType: '',
          muscleGroup,
        },
      ],
    };
  });
}

export function removePlannedExerciseFromDay(
  mesocycleDays: MesocycleDayDraft[],
  dayIndex: number,
  plannedExerciseIndex: number
) {
  return mesocycleDays.map((day, index) => {
    if (index !== dayIndex) {
      return day;
    }

    return {
      ...day,
      plannedExercises: day.plannedExercises
        .filter((_, exerciseIndex) => exerciseIndex !== plannedExerciseIndex)
        .map((exercise, exerciseOrder) => ({
          ...exercise,
          exerciseOrder,
        })),
    };
  });
}

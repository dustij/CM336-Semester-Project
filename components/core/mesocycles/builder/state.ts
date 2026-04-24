import type {
  MesocycleDayDraft,
  PlannedExerciseDraft,
  Weekday,
} from '@/lib/core/types';

export function updateMesocycleDayOfWeek(
  mesocycleDays: MesocycleDayDraft[],
  dayIndex: number,
  dayOfWeek: Weekday | null
) {
  return mesocycleDays.map((day, index) => {
    if (index !== dayIndex) {
      return day;
    }

    return {
      ...day,
      dayOfWeek,
    };
  });
}

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
          id: null,
          name: null,
          equipment: null,
          exerciseOrder: day.plannedExercises.length,
          exerciseType: '',
          muscleGroup,
        },
      ],
    };
  });
}

export function updatePlannedExerciseInDay(
  mesocycleDays: MesocycleDayDraft[],
  dayIndex: number,
  plannedExerciseIndex: number,
  plannedExercise: PlannedExerciseDraft
) {
  return mesocycleDays.map((day, index) => {
    if (index !== dayIndex) {
      return day;
    }

    return {
      ...day,
      plannedExercises: day.plannedExercises.map((exercise, exerciseIndex) =>
        exerciseIndex === plannedExerciseIndex ? plannedExercise : exercise
      ),
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

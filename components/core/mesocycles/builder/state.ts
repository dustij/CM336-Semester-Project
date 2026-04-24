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

export function removeDayFromMesocycleTemplate(
  mesocycleDays: MesocycleDayDraft[],
  dayIndex: number
) {
  if (mesocycleDays.length <= 1 || dayIndex === 0) {
    return mesocycleDays;
  }

  return mesocycleDays
    .filter((_, index) => index !== dayIndex)
    .map((day, dayOrder) => ({
      ...day,
      dayOrder,
    }));
}

export function duplicateDayInMesocycleTemplate(
  mesocycleDays: MesocycleDayDraft[],
  dayIndex: number
) {
  if (
    mesocycleDays.length >= 7 ||
    dayIndex < 0 ||
    dayIndex >= mesocycleDays.length
  ) {
    return mesocycleDays;
  }

  const duplicatedDay: MesocycleDayDraft = {
    ...mesocycleDays[dayIndex],
    dayOfWeek: null,
    plannedExercises: mesocycleDays[dayIndex].plannedExercises.map(
      (plannedExercise) => ({ ...plannedExercise })
    ),
  };

  return [
    ...mesocycleDays.slice(0, dayIndex + 1),
    duplicatedDay,
    ...mesocycleDays.slice(dayIndex + 1),
  ].map((day, dayOrder) => ({
    ...day,
    dayOrder,
  }));
}

export function addDayToMesocycleTemplate(
  mesocycleDays: MesocycleDayDraft[]
) {
  if (mesocycleDays.length >= 7) {
    return mesocycleDays;
  }

  const nextDayOrder =
    mesocycleDays.reduce(
      (maxDayOrder, day) => Math.max(maxDayOrder, day.dayOrder),
      -1
    ) + 1;

  return [
    ...mesocycleDays,
    {
      dayOfWeek: null,
      dayOrder: nextDayOrder,
      plannedExercises: [],
    },
  ];
}

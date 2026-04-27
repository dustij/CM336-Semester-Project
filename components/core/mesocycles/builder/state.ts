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

export function changePlannedExerciseMuscleGroupInDay(
  mesocycleDays: MesocycleDayDraft[],
  dayIndex: number,
  plannedExerciseIndex: number,
  muscleGroup: string
) {
  const day = mesocycleDays[dayIndex];

  if (
    day == null ||
    plannedExerciseIndex < 0 ||
    plannedExerciseIndex >= day.plannedExercises.length
  ) {
    return mesocycleDays;
  }

  return updatePlannedExerciseInDay(
    mesocycleDays,
    dayIndex,
    plannedExerciseIndex,
    {
      ...day.plannedExercises[plannedExerciseIndex],
      id: null,
      name: null,
      equipment: null,
      exerciseType: '',
      muscleGroup,
    }
  );
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

export function movePlannedExerciseInDay(
  mesocycleDays: MesocycleDayDraft[],
  dayIndex: number,
  fromPlannedExerciseIndex: number,
  toPlannedExerciseIndex: number
) {
  const day = mesocycleDays[dayIndex];

  if (
    day == null ||
    fromPlannedExerciseIndex === toPlannedExerciseIndex ||
    fromPlannedExerciseIndex < 0 ||
    toPlannedExerciseIndex < 0 ||
    fromPlannedExerciseIndex >= day.plannedExercises.length ||
    toPlannedExerciseIndex >= day.plannedExercises.length
  ) {
    return mesocycleDays;
  }

  return mesocycleDays.map((currentDay, index) => {
    if (index !== dayIndex) {
      return currentDay;
    }

    const plannedExercises = [...currentDay.plannedExercises];
    const [movedExercise] = plannedExercises.splice(fromPlannedExerciseIndex, 1);
    plannedExercises.splice(toPlannedExerciseIndex, 0, movedExercise);

    return {
      ...currentDay,
      plannedExercises: plannedExercises.map((exercise, exerciseOrder) => ({
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
  if (
    mesocycleDays.length <= 1 ||
    dayIndex < 0 ||
    dayIndex >= mesocycleDays.length
  ) {
    return mesocycleDays;
  }

  return mesocycleDays
    .filter((_, index) => index !== dayIndex)
    .map((day, dayOrder) => ({
      ...day,
      dayOrder,
    }));
}

export function moveDayInMesocycleTemplate(
  mesocycleDays: MesocycleDayDraft[],
  fromDayIndex: number,
  toDayIndex: number
) {
  if (
    fromDayIndex === toDayIndex ||
    fromDayIndex < 0 ||
    toDayIndex < 0 ||
    fromDayIndex >= mesocycleDays.length ||
    toDayIndex >= mesocycleDays.length
  ) {
    return mesocycleDays;
  }

  const nextMesocycleDays = [...mesocycleDays];
  const [movedDay] = nextMesocycleDays.splice(fromDayIndex, 1);
  nextMesocycleDays.splice(toDayIndex, 0, movedDay);

  return nextMesocycleDays.map((day, dayOrder) => ({
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

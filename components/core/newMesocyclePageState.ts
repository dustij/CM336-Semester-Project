export type MesocycleDay = {
  dayOfWeek:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';
  dayOrder: number;
  plannedExercises: PlannedExercise[];
};

export type PlannedExercise = {
  exerciseId: number;
  exerciseName: string;
  exerciseOrder: number;
  exerciseType: string;
  equipment: string;
  muscleGroup: string;
};

export function addMuscleGroupToDay(
  mesocycleDays: MesocycleDay[],
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
          exerciseId: 0,
          exerciseName: muscleGroup,
          exerciseOrder: day.plannedExercises.length,
          exerciseType: '',
          equipment: '',
          muscleGroup,
        },
      ],
    };
  });
}

export function removePlannedExerciseFromDay(
  mesocycleDays: MesocycleDay[],
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

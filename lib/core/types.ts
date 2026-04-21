export type Weekday =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type MesocycleStatus = 'active' | 'nonactive' | 'completed';

export type WorkoutSessionStatus = 'planned' | 'in_progress' | 'completed';

export type MesocycleListItem = {
  id: number;
  title: string;
};

export type ExerciseListItem = {
  id: number;
  name: string;
  equipment: string;
};

export type ExercisesByMuscleGroup = Record<string, ExerciseListItem[]>;

export type PlannedExercisePlan = {
  id: number;
  exerciseId: number;
  exerciseOrder: number;
};

export type MesocycleDayPlan = {
  id: number;
  dayOfWeek: Weekday;
  dayOrder: number;
  plannedExercises: PlannedExercisePlan[];
};

export type PerformedSet = {
  id: number;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
};

export type PerformedExercise = {
  id: number;
  exerciseId: number;
  plannedExerciseId: number | null;
  exerciseOrder: number;
  isSubstituted: boolean;
  completed: boolean;
  notes: string | null;
  sets: PerformedSet[];
};

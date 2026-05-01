import 'server-only';

import * as db from '@/db/server/db';
import type { Weekday } from '@/lib/core/types';
import type { RowDataPacket } from 'mysql2';
import { cacheLife, cacheTag } from 'next/cache';
import {
  selectCurrentAddedPerformedExercisesByUserId,
  selectCurrentInstanceByUserId,
} from '../sql/ts/mesocycle_instance/query';

/**
 * 
 Current mesocycle instance flow:

When a user starts a mesocycle template, the app creates one mesocycle_instance 
row and marks it as the user's current instance. The app also creates the first 
instance_day row for week 1 using the first template_day in day_order sequence.

Instance days are not created all at once. They are created progressively as the 
user moves through the mesocycle.

Each instance_day represents one scheduled workout day from the template for a 
specific week. For example, a 3-week template with 3 days per week can produce 
up to 9 instance_day rows by the time the cycle is finished.

When the current instance_day is updated to either COMPLETED or ABANDONED, the 
database should create the next instance_day for the same mesocycle_instance. 
The next day is determined from the template_day ordering:

- If there is another template_day later in the same week, create an 
instance_day for that template_day with the same week_number.

- If the current day is the last template_day of the week and the mesocycle has 
more weeks remaining, create an instance_day for the first template_day with 
week_number + 1.

- If the current day is the last template_day of the final week, no new 
instance_day is created and the mesocycle_instance can be considered complete.

The instance_day status controls progression:
- PLANNED: scheduled/current day
- COMPLETED: user finished the day
- ABANDONED: user skipped/ended the day, but progression should still continue

Both COMPLETED and ABANDONED advance the mesocycle to the next scheduled 
template day. Other statuses should not trigger creation of the next 
instance_day.


 */

type InstanceDayStatus = 'PLANNED' | 'COMPLETED' | 'ABANDONED';
export type PerformedExerciseStatus =
  | 'COMPLETED'
  | 'REPLACED'
  | 'SKIPPED'
  | 'ADDED';

type CurrentInstanceRow = RowDataPacket & {
  instance_id: number;
  template_id: number;
  user_id: number;
  instance_start_date: Date;
  instance_end_date: Date | null;
  is_current: boolean;
  title: string;
  duration_weeks: number;
  instance_day_id: number;
  week_number: number;
  instance_day_end_date: Date | null;
  status: InstanceDayStatus;
  template_day_id: number;
  day_of_week: Weekday;
  day_order: number;
  planned_exercise_id: number | null;
  planned_exercise_order: number | null;
  exercise_id: number | null;
  exercise_name: string | null;
  equipment: string | null;
  muscle_group: string | null;
  current_performed_exercise_id: number | null;
  current_performed_exercise_exercise_id: number | null;
  current_performed_exercise_order: number | null;
  current_performed_exercise_status: PerformedExerciseStatus | null;
  current_performed_exercise_name: string | null;
  current_performed_exercise_equipment: string | null;
  current_performed_exercise_muscle_group: string | null;
  current_set_id: number | null;
  current_set_order: number | null;
  current_set_weight: number | null;
  current_set_reps: number | null;
  current_set_is_completed: boolean | number | null;
  previous_instance_day_id: number | null;
  previous_performed_exercise_id: number | null;
  previous_performed_exercise_exercise_id: number | null;
  previous_performed_exercise_order: number | null;
  previous_performed_exercise_status: PerformedExerciseStatus | null;
  previous_performed_exercise_name: string | null;
  previous_performed_exercise_equipment: string | null;
  previous_performed_exercise_muscle_group: string | null;
  previous_set_id: number | null;
  previous_set_order: number | null;
  previous_set_weight: number | null;
  previous_set_reps: number | null;
  previous_set_is_completed: boolean | number | null;
};

type CurrentAddedPerformedExerciseRow = RowDataPacket & {
  instance_day_id: number;
  performed_exercise_id: number;
  exercise_id: number;
  exercise_order: number;
  status: PerformedExerciseStatus;
  exercise_name: string;
  equipment: string | null;
  muscle_group: string | null;
  set_id: number | null;
  set_order: number | null;
  weight: number | null;
  reps: number | null;
  is_completed: boolean | number | null;
};

export type CurrentInstancePreviousSet = {
  id: number;
  setOrder: number;
  weight: number;
  reps: number;
  completed: boolean;
};

export type CurrentInstancePerformedSet = {
  id: number;
  setOrder: number;
  weight: number;
  reps: number;
  completed: boolean;
};

export type CurrentInstanceExerciseSnapshot = {
  id: number;
  name: string;
  equipment: string | null;
  muscleGroup: string | null;
};

export type CurrentInstanceExercise = {
  source: 'TEMPLATE';
  plannedExerciseId: number;
  exerciseId: number;
  name: string;
  equipment: string | null;
  muscleGroup: string | null;
  exerciseOrder: number;
  performedExerciseId: number | null;
  performedExerciseStatus: PerformedExerciseStatus | null;
  performedSets: CurrentInstancePerformedSet[];
  templateExercise: CurrentInstanceExerciseSnapshot;
  performedExercise: CurrentInstancePerformedExercise | null;
  previousInstanceDayId: number | null;
  previousPerformedExerciseId: number | null;
  previousSets: CurrentInstancePreviousSet[];
  previousPerformance: CurrentInstancePreviousPerformance | null;
};

export type CurrentInstancePerformedExercise = {
  id: number;
  plannedExerciseId: number | null;
  exerciseOrder: number;
  status: PerformedExerciseStatus;
  exercise: CurrentInstanceExerciseSnapshot;
  sets: CurrentInstancePerformedSet[];
};

export type CurrentInstancePreviousPerformance = {
  instanceDayId: number;
  performedExercise: {
    id: number;
    plannedExerciseId: number | null;
    exerciseOrder: number;
    status: PerformedExerciseStatus;
    exercise: CurrentInstanceExerciseSnapshot;
    sets: CurrentInstancePreviousSet[];
  };
};

export type CurrentInstanceDay = {
  id: number;
  templateDayId: number;
  weekNumber: number;
  dayOfWeek: Weekday;
  dayOrder: number;
  status: InstanceDayStatus;
  endDate: Date | null;
  templateTitle: string;
  exercises: CurrentInstanceExercise[];
  addedExercises: CurrentInstancePerformedExercise[];
};

export type CurrentMesocycleInstanceDetails = {
  id: number;
  templateId: number;
  userId: number;
  title: string;
  durationWeeks: number;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  days: CurrentInstanceDay[];
};

export async function getCurrentMesocycleInstanceDetails(
  userId: number
): Promise<CurrentMesocycleInstanceDetails | null> {
  'use cache';
  cacheTag(`mesocycles:user:${userId}`);
  cacheLife('max'); // max because we manually invalidate after user selects a mesocycle as current

  const [rows, addedRows] = (await Promise.all([
    db.query(selectCurrentInstanceByUserId, [userId]),
    db.query(selectCurrentAddedPerformedExercisesByUserId, [userId]),
  ])) as [CurrentInstanceRow[], CurrentAddedPerformedExerciseRow[]];

  const instance = rows[0];

  if (instance == null) {
    return null;
  }

  const daysById = new Map<number, CurrentInstanceDay>();
  const exercisesByDayAndPlanId = new Map<string, CurrentInstanceExercise>();

  for (const row of rows) {
    const day =
      daysById.get(row.instance_day_id) ??
      ({
        id: row.instance_day_id,
        templateDayId: row.template_day_id,
        weekNumber: row.week_number,
        dayOfWeek: row.day_of_week,
        dayOrder: row.day_order,
        status: row.status,
        endDate: row.instance_day_end_date,
        templateTitle: row.title,
        exercises: [],
        addedExercises: [],
      } satisfies CurrentInstanceDay);

    if (!daysById.has(row.instance_day_id)) {
      daysById.set(row.instance_day_id, day);
    }

    if (
      row.planned_exercise_id == null ||
      row.planned_exercise_order == null ||
      row.exercise_id == null ||
      row.exercise_name == null
    ) {
      continue;
    }

    const exerciseKey = `${row.instance_day_id}:${row.planned_exercise_id}`;
    const exercise =
      exercisesByDayAndPlanId.get(exerciseKey) ??
      ({
        source: 'TEMPLATE',
        plannedExerciseId: row.planned_exercise_id,
        exerciseId: row.exercise_id,
        name: row.exercise_name,
        equipment: row.equipment,
        muscleGroup: row.muscle_group,
        exerciseOrder: row.planned_exercise_order,
        performedExerciseId: row.current_performed_exercise_id,
        performedExerciseStatus: row.current_performed_exercise_status,
        performedSets: [],
        templateExercise: {
          id: row.exercise_id,
          name: row.exercise_name,
          equipment: row.equipment,
          muscleGroup: row.muscle_group,
        },
        performedExercise:
          row.current_performed_exercise_id != null &&
          row.current_performed_exercise_exercise_id != null &&
          row.current_performed_exercise_order != null &&
          row.current_performed_exercise_status != null &&
          row.current_performed_exercise_name != null
            ? {
                id: row.current_performed_exercise_id,
                plannedExerciseId: row.planned_exercise_id,
                exerciseOrder: row.current_performed_exercise_order,
                status: row.current_performed_exercise_status,
                exercise: {
                  id: row.current_performed_exercise_exercise_id,
                  name: row.current_performed_exercise_name,
                  equipment: row.current_performed_exercise_equipment,
                  muscleGroup: row.current_performed_exercise_muscle_group,
                },
                sets: [],
              }
            : null,
        previousInstanceDayId: row.previous_instance_day_id,
        previousPerformedExerciseId: row.previous_performed_exercise_id,
        previousSets: [],
        previousPerformance:
          row.previous_instance_day_id != null &&
          row.previous_performed_exercise_id != null &&
          row.previous_performed_exercise_exercise_id != null &&
          row.previous_performed_exercise_order != null &&
          row.previous_performed_exercise_status != null &&
          row.previous_performed_exercise_name != null
            ? {
                instanceDayId: row.previous_instance_day_id,
                performedExercise: {
                  id: row.previous_performed_exercise_id,
                  plannedExerciseId: row.planned_exercise_id,
                  exerciseOrder: row.previous_performed_exercise_order,
                  status: row.previous_performed_exercise_status,
                  exercise: {
                    id: row.previous_performed_exercise_exercise_id,
                    name: row.previous_performed_exercise_name,
                    equipment: row.previous_performed_exercise_equipment,
                    muscleGroup: row.previous_performed_exercise_muscle_group,
                  },
                  sets: [],
                },
              }
            : null,
      } satisfies CurrentInstanceExercise);

    if (!exercisesByDayAndPlanId.has(exerciseKey)) {
      exercisesByDayAndPlanId.set(exerciseKey, exercise);
      day.exercises.push(exercise);
    }

    if (
      row.current_set_id != null &&
      row.current_set_order != null &&
      row.current_set_weight != null &&
      row.current_set_reps != null &&
      !exercise.performedSets.some(
        (performedSet) => performedSet.id === row.current_set_id
      )
    ) {
      exercise.performedSets.push({
        id: row.current_set_id,
        setOrder: row.current_set_order,
        weight: row.current_set_weight,
        reps: row.current_set_reps,
        completed: Boolean(row.current_set_is_completed),
      });

      exercise.performedExercise?.sets.push({
        id: row.current_set_id,
        setOrder: row.current_set_order,
        weight: row.current_set_weight,
        reps: row.current_set_reps,
        completed: Boolean(row.current_set_is_completed),
      });
    }

    if (
      row.previous_set_id == null ||
      row.previous_set_order == null ||
      row.previous_set_weight == null ||
      row.previous_set_reps == null
    ) {
      continue;
    }

    if (
      exercise.previousSets.some(
        (previousSet) => previousSet.id === row.previous_set_id
      )
    ) {
      continue;
    }

    exercise.previousSets.push({
      id: row.previous_set_id,
      setOrder: row.previous_set_order,
      weight: row.previous_set_weight,
      reps: row.previous_set_reps,
      completed: Boolean(row.previous_set_is_completed),
    });

    exercise.previousPerformance?.performedExercise.sets.push({
      id: row.previous_set_id,
      setOrder: row.previous_set_order,
      weight: row.previous_set_weight,
      reps: row.previous_set_reps,
      completed: Boolean(row.previous_set_is_completed),
    });
  }

  const addedExercisesByDayAndPerformedId = new Map<
    string,
    CurrentInstancePerformedExercise
  >();

  for (const row of addedRows) {
    const day = daysById.get(row.instance_day_id);

    if (day == null) {
      continue;
    }

    const exerciseKey = `${row.instance_day_id}:${row.performed_exercise_id}`;
    const addedExercise =
      addedExercisesByDayAndPerformedId.get(exerciseKey) ??
      ({
        id: row.performed_exercise_id,
        plannedExerciseId: null,
        exerciseOrder: row.exercise_order,
        status: row.status,
        exercise: {
          id: row.exercise_id,
          name: row.exercise_name,
          equipment: row.equipment,
          muscleGroup: row.muscle_group,
        },
        sets: [],
      } satisfies CurrentInstancePerformedExercise);

    if (!addedExercisesByDayAndPerformedId.has(exerciseKey)) {
      addedExercisesByDayAndPerformedId.set(exerciseKey, addedExercise);
      day.addedExercises.push(addedExercise);
    }

    if (
      row.set_id == null ||
      row.set_order == null ||
      row.weight == null ||
      row.reps == null ||
      addedExercise.sets.some((set) => set.id === row.set_id)
    ) {
      continue;
    }

    addedExercise.sets.push({
      id: row.set_id,
      setOrder: row.set_order,
      weight: row.weight,
      reps: row.reps,
      completed: Boolean(row.is_completed),
    });
  }

  return {
    id: instance.instance_id,
    templateId: instance.template_id,
    userId: instance.user_id,
    title: instance.title,
    durationWeeks: instance.duration_weeks,
    startDate: instance.instance_start_date,
    endDate: instance.instance_end_date,
    isCurrent: Boolean(instance.is_current),
    days: Array.from(daysById.values()),
  };
}

export async function getCurrentInstanceDay(
  userId: number
): Promise<CurrentInstanceDay | null> {
  'use cache';
  cacheTag(`mesocycles:user:${userId}`);
  cacheLife('max');

  const currentInstance = await getCurrentMesocycleInstanceDetails(userId);

  if (currentInstance == null) {
    return null;
  }

  const currentInstanceDay =
    currentInstance.days.find((day) => day.status === 'PLANNED') ?? null;

  // console.log(JSON.stringify(currentInstanceDay, null, 2));

  return currentInstanceDay;
}

export type LogSetForPlannedExerciseInput = {
  userId: number;
  currentInstanceDayId: number;
  plannedExerciseId: number;
  set: {
    setOrder: number;
    weight: number;
    reps: number;
    completed: boolean;
  };
};

export type SkipPlannedExerciseInput = {
  userId: number;
  currentInstanceDayId: number;
  plannedExerciseId: number;
};

export type ReplacePlannedExerciseInput = {
  userId: number;
  currentInstanceDayId: number;
  plannedExerciseId: number;
  replacementExerciseId: number;
  replaceOnTemplate: boolean;
};

export type AddExerciseToCurrentDayInput = {
  userId: number;
  currentInstanceDayId: number;
  exerciseId: number;
  exerciseOrder: number;
};

export type DeletePerformedExerciseInput = {
  userId: number;
  currentInstanceDayId: number;
  performedExerciseId: number;
};

export type CompleteCurrentInstanceDayInput = {
  userId: number;
  currentInstanceDayId: number;
  status: 'COMPLETED' | 'ABANDONED';
};

//
// Current Instance Day Object:
//
// {
//   "id": 4,
//   "templateDayId": 1,
//   "weekNumber": 1,
//   "dayOfWeek": "Monday",
//   "dayOrder": 0,
//   "status": "PLANNED",
//   "endDate": null,
//   "templateTitle": "MT Template",
//   "exercises": [
//     {
//       "source": "TEMPLATE",
//       "plannedExerciseId": 1,
//       "exerciseId": 6,
//       "name": "Alternate Lateral Pulldown",
//       "equipment": "Cable",
//       "muscleGroup": "Back",
//       "exerciseOrder": 0,
//       "performedExerciseId": null,
//       "performedExerciseStatus": null,
//       "performedSets": [],
//       "templateExercise": {
//         "id": 6,
//         "name": "Alternate Lateral Pulldown",
//         "equipment": "Cable",
//         "muscleGroup": "Back"
//       },
//       "performedExercise": null,
//       "previousInstanceDayId": null,
//       "previousPerformedExerciseId": null,
//       "previousSets": [],
//       "previousPerformance": null
//     }
//   ],
//   "addedExercises": []
// }

export type CurrentInstanceRepository = {
  getCurrentMesocycleInstanceDetails(
    userId: number
  ): Promise<CurrentMesocycleInstanceDetails | null>;
  getCurrentInstanceDay(userId: number): Promise<CurrentInstanceDay | null>;
  logSetForPlannedExercise(input: LogSetForPlannedExerciseInput): Promise<void>;
  skipPlannedExercise(input: SkipPlannedExerciseInput): Promise<void>;
  replacePlannedExercise(input: ReplacePlannedExerciseInput): Promise<void>;
  addExerciseToCurrentDay(input: AddExerciseToCurrentDayInput): Promise<void>;
  deletePerformedExercise(input: DeletePerformedExerciseInput): Promise<void>;
  completeCurrentInstanceDay(
    input: CompleteCurrentInstanceDayInput
  ): Promise<void>;
};

import 'server-only';

import type { ExerciseCatalogListItem } from '@/lib/core/types';
import type {
  CurrentInstanceDay,
  CurrentInstanceExercise,
  CurrentInstanceExerciseSnapshot,
  CurrentInstancePerformedExercise,
  CurrentInstancePerformedSet,
  CurrentInstancePreviousPerformance,
  CurrentInstancePreviousSet,
  CurrentInstanceRepository,
  CurrentMesocycleInstanceDetails,
  LogSetForPlannedExerciseInput,
  ReplacePlannedExerciseInput,
  SkipPlannedExerciseInput,
} from './current_repository';

type TemplateDayDefinition = {
  templateDayId: number;
  dayOfWeek: CurrentInstanceDay['dayOfWeek'];
  dayOrder: number;
};

type TemplateExerciseDefinition = {
  plannedExerciseId: number;
  templateDayId: number;
  exerciseOrder: number;
  exercise: CurrentInstanceExerciseSnapshot;
};

const USER_ID = 1;
const MOCK_TEMPLATE_TITLE = 'Upper Body 1';

const EXERCISES: Record<number, CurrentInstanceExerciseSnapshot> = {
  1: {
    id: 1,
    name: 'Bench Press (Incline)',
    equipment: 'Barbell',
    muscleGroup: 'Chest',
  },
  2: {
    id: 2,
    name: 'Dumbbell Skullcrusher',
    equipment: 'Dumbbell',
    muscleGroup: 'Triceps',
  },
  3: {
    id: 3,
    name: 'Machine Chest Press',
    equipment: 'Machine',
    muscleGroup: 'Chest',
  },
  4: {
    id: 4,
    name: 'Cable Fly',
    equipment: 'Cable',
    muscleGroup: 'Chest',
  },
  5: {
    id: 5,
    name: 'Cable Triceps Pushdown',
    equipment: 'Cable',
    muscleGroup: 'Triceps',
  },
  6: {
    id: 6,
    name: 'Overhead Triceps Extension',
    equipment: 'Dumbbell',
    muscleGroup: 'Triceps',
  },
};

const TEMPLATE_DAYS: TemplateDayDefinition[] = [
  { templateDayId: 1, dayOfWeek: 'Monday', dayOrder: 1 },
  { templateDayId: 2, dayOfWeek: 'Wednesday', dayOrder: 2 },
  { templateDayId: 3, dayOfWeek: 'Friday', dayOrder: 3 },
];

const templateExercises: TemplateExerciseDefinition[] = [
  {
    plannedExerciseId: 1,
    templateDayId: 1,
    exerciseOrder: 0,
    exercise: EXERCISES[1],
  },
  {
    plannedExerciseId: 2,
    templateDayId: 1,
    exerciseOrder: 1,
    exercise: EXERCISES[2],
  },
  {
    plannedExerciseId: 1,
    templateDayId: 2,
    exerciseOrder: 0,
    exercise: EXERCISES[1],
  },
  {
    plannedExerciseId: 2,
    templateDayId: 2,
    exerciseOrder: 1,
    exercise: EXERCISES[2],
  },
  {
    plannedExerciseId: 1,
    templateDayId: 3,
    exerciseOrder: 0,
    exercise: EXERCISES[1],
  },
  {
    plannedExerciseId: 2,
    templateDayId: 3,
    exerciseOrder: 1,
    exercise: EXERCISES[2],
  },
];

let nextInstanceDayId = 1;
let nextPerformedExerciseId = 1;
let nextSetId = 1;

const currentInstance: CurrentMesocycleInstanceDetails = {
  id: 1,
  templateId: 1,
  userId: USER_ID,
  title: MOCK_TEMPLATE_TITLE,
  durationWeeks: 3,
  startDate: new Date('2026-04-20T00:00:00'),
  endDate: null,
  isCurrent: true,
  days: [],
};

seedCurrentInstance();

export const currentMockRepository: CurrentInstanceRepository = {
  async getCurrentMesocycleInstanceDetails(userId) {
    if (userId !== currentInstance.userId || !currentInstance.isCurrent) {
      return null;
    }

    return cloneCurrentInstance(currentInstance);
  },

  async getCurrentInstanceDay(userId) {
    const instance = await this.getCurrentMesocycleInstanceDetails(userId);
    return instance?.days.find((day) => day.status === 'PLANNED') ?? null;
  },

  async logSetForPlannedExercise(input) {
    const exercise = getPlannedExerciseForInput(input);
    const performedExercise = ensurePerformedExercise(exercise, 'COMPLETED');
    upsertSet(performedExercise.sets, input.set);
    syncPerformedExercise(exercise, performedExercise);
  },

  async skipPlannedExercise(input) {
    const exercise = getPlannedExerciseForInput(input);
    const performedExercise = ensurePerformedExercise(exercise, 'SKIPPED');
    performedExercise.sets = [];
    syncPerformedExercise(exercise, performedExercise);
  },

  async replacePlannedExercise(input) {
    const exercise = getPlannedExerciseForInput(input);
    const replacement = getExerciseSnapshot(input.replacementExerciseId);
    const performedExercise = ensurePerformedExercise(exercise, 'REPLACED');

    performedExercise.exercise = replacement;
    syncPerformedExercise(exercise, performedExercise);

    if (input.replaceOnTemplate) {
      const templateExercise = templateExercises.find(
        (item) => item.plannedExerciseId === input.plannedExerciseId
      );

      if (templateExercise == null) {
        throw new Error('Planned exercise not found on template.');
      }

      templateExercise.exercise = replacement;
      applyTemplateExercise(exercise, replacement);
    }
  },

  async addExerciseToCurrentDay(input) {
    assertUser(input.userId);
    const day = getMutableDay(input.currentInstanceDayId);
    const exercise = getExerciseSnapshot(input.exerciseId);

    day.addedExercises.push({
      id: nextPerformedExerciseId++,
      plannedExerciseId: null,
      exerciseOrder: input.exerciseOrder,
      status: 'ADDED',
      exercise,
      sets: [],
    });
  },

  async deletePerformedExercise(input) {
    assertUser(input.userId);
    const day = getMutableDay(input.currentInstanceDayId);

    for (const exercise of day.exercises) {
      if (exercise.performedExerciseId !== input.performedExerciseId) {
        continue;
      }

      exercise.performedExerciseId = null;
      exercise.performedExerciseStatus = null;
      exercise.performedExercise = null;
      exercise.performedSets = [];
      return;
    }

    day.addedExercises = day.addedExercises.filter(
      (exercise) => exercise.id !== input.performedExerciseId
    );
  },

  async completeCurrentInstanceDay(input) {
    assertUser(input.userId);
    const day = getMutableDay(input.currentInstanceDayId);

    day.status = input.status;
    day.endDate = new Date();

    if (input.status === 'COMPLETED' || input.status === 'ABANDONED') {
      appendNextInstanceDay(day);
    }
  },
};

export const getCurrentMesocycleInstanceDetails =
  currentMockRepository.getCurrentMesocycleInstanceDetails.bind(
    currentMockRepository
  );
export const getCurrentInstanceDay =
  currentMockRepository.getCurrentInstanceDay.bind(currentMockRepository);
export const logSetForPlannedExercise =
  currentMockRepository.logSetForPlannedExercise.bind(currentMockRepository);
export const skipPlannedExercise =
  currentMockRepository.skipPlannedExercise.bind(currentMockRepository);
export const replacePlannedExercise =
  currentMockRepository.replacePlannedExercise.bind(currentMockRepository);
export const addExerciseToCurrentDay =
  currentMockRepository.addExerciseToCurrentDay.bind(currentMockRepository);
export const deletePerformedExercise =
  currentMockRepository.deletePerformedExercise.bind(currentMockRepository);
export const completeCurrentInstanceDay =
  currentMockRepository.completeCurrentInstanceDay.bind(currentMockRepository);

export function getCurrentMockExerciseCatalog(): ExerciseCatalogListItem[] {
  return Object.values(EXERCISES).map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    equipment: exercise.equipment ?? 'Unknown',
    muscleGroup: exercise.muscleGroup ?? 'Unknown',
  }));
}

function seedCurrentInstance() {
  const previousMonday = createInstanceDay(TEMPLATE_DAYS[0], 1);
  previousMonday.status = 'COMPLETED';
  previousMonday.endDate = new Date('2026-04-20T00:00:00');

  seedPerformedSets(previousMonday.exercises[0], [
    { weight: 135, reps: 9 },
    { weight: 135, reps: 9 },
  ]);
  seedPerformedSets(previousMonday.exercises[1], [
    { weight: 50, reps: 10 },
    { weight: 50, reps: 10 },
    { weight: 50, reps: 10 },
  ]);

  currentInstance.days.push(previousMonday);
  currentInstance.days.push(createInstanceDay(TEMPLATE_DAYS[0], 2));
}

function seedPerformedSets(
  exercise: CurrentInstanceExercise,
  sets: Array<{ weight: number; reps: number }>
) {
  const performedExercise = ensurePerformedExercise(exercise, 'COMPLETED');

  performedExercise.sets = sets.map((set, index) => ({
    id: nextSetId++,
    setOrder: index + 1,
    weight: set.weight,
    reps: set.reps,
    completed: true,
  }));

  syncPerformedExercise(exercise, performedExercise);
}

function createInstanceDay(
  templateDay: TemplateDayDefinition,
  weekNumber: number
): CurrentInstanceDay {
  const previousDay = findPreviousDay(templateDay.templateDayId, weekNumber);

  return {
    id: nextInstanceDayId++,
    templateDayId: templateDay.templateDayId,
    weekNumber,
    dayOfWeek: templateDay.dayOfWeek,
    dayOrder: templateDay.dayOrder,
    status: 'PLANNED',
    endDate: null,
    templateTitle: MOCK_TEMPLATE_TITLE,
    exercises: templateExercises
      .filter(
        (exercise) => exercise.templateDayId === templateDay.templateDayId
      )
      .map((exercise) =>
        createCurrentInstanceExercise(exercise, previousDay ?? null)
      ),
    addedExercises: [],
  };
}

function createCurrentInstanceExercise(
  templateExercise: TemplateExerciseDefinition,
  previousDay: CurrentInstanceDay | null
): CurrentInstanceExercise {
  const previousExercise =
    previousDay?.exercises.find(
      (exercise) =>
        exercise.plannedExerciseId === templateExercise.plannedExerciseId
    ) ?? null;
  const previousPerformedExercise = previousExercise?.performedExercise ?? null;
  const previousPerformance = previousPerformedExercise
    ? ({
        instanceDayId: previousDay?.id ?? 0,
        performedExercise: {
          ...previousPerformedExercise,
          sets: clonePreviousSets(previousPerformedExercise.sets),
        },
      } satisfies CurrentInstancePreviousPerformance)
    : null;

  return {
    source: 'TEMPLATE',
    plannedExerciseId: templateExercise.plannedExerciseId,
    exerciseId: templateExercise.exercise.id,
    name: templateExercise.exercise.name,
    equipment: templateExercise.exercise.equipment,
    muscleGroup: templateExercise.exercise.muscleGroup,
    exerciseOrder: templateExercise.exerciseOrder,
    performedExerciseId: null,
    performedExerciseStatus: null,
    performedSets: [],
    templateExercise: cloneExerciseSnapshot(templateExercise.exercise),
    performedExercise: null,
    previousInstanceDayId: previousDay?.id ?? null,
    previousPerformedExerciseId: previousPerformedExercise?.id ?? null,
    previousSets: previousPerformance?.performedExercise.sets ?? [],
    previousPerformance,
  };
}

function appendNextInstanceDay(completedDay: CurrentInstanceDay) {
  if (currentInstance.days.some((day) => day.status === 'PLANNED')) {
    return;
  }

  const nextTemplateDay =
    TEMPLATE_DAYS.find((day) => day.dayOrder === completedDay.dayOrder + 1) ??
    TEMPLATE_DAYS[0];
  const nextWeekNumber =
    nextTemplateDay.dayOrder === 0
      ? completedDay.weekNumber + 1
      : completedDay.weekNumber;

  if (nextWeekNumber > currentInstance.durationWeeks) {
    currentInstance.endDate = new Date();
    currentInstance.isCurrent = false;
    return;
  }

  currentInstance.days.push(createInstanceDay(nextTemplateDay, nextWeekNumber));
}

function findPreviousDay(templateDayId: number, weekNumber: number) {
  if (weekNumber <= 1) {
    return null;
  }

  return (
    currentInstance.days.find(
      (day) =>
        day.templateDayId === templateDayId &&
        day.weekNumber === weekNumber - 1 &&
        (day.status === 'COMPLETED' || day.status === 'ABANDONED')
    ) ?? null
  );
}

function ensurePerformedExercise(
  exercise: CurrentInstanceExercise,
  status: CurrentInstancePerformedExercise['status']
) {
  if (exercise.performedExercise != null) {
    exercise.performedExercise.status = status;
    exercise.performedExerciseStatus = status;
    return exercise.performedExercise;
  }

  const performedExercise: CurrentInstancePerformedExercise = {
    id: nextPerformedExerciseId++,
    plannedExerciseId: exercise.plannedExerciseId,
    exerciseOrder: exercise.exerciseOrder,
    status,
    exercise: cloneExerciseSnapshot(exercise.templateExercise),
    sets: [],
  };

  syncPerformedExercise(exercise, performedExercise);
  return performedExercise;
}

function syncPerformedExercise(
  exercise: CurrentInstanceExercise,
  performedExercise: CurrentInstancePerformedExercise
) {
  exercise.performedExercise = performedExercise;
  exercise.performedExerciseId = performedExercise.id;
  exercise.performedExerciseStatus = performedExercise.status;
  exercise.performedSets = performedExercise.sets;
}

function applyTemplateExercise(
  exercise: CurrentInstanceExercise,
  snapshot: CurrentInstanceExerciseSnapshot
) {
  exercise.exerciseId = snapshot.id;
  exercise.name = snapshot.name;
  exercise.equipment = snapshot.equipment;
  exercise.muscleGroup = snapshot.muscleGroup;
  exercise.templateExercise = cloneExerciseSnapshot(snapshot);
}

function getPlannedExerciseForInput(
  input:
    | LogSetForPlannedExerciseInput
    | SkipPlannedExerciseInput
    | ReplacePlannedExerciseInput
) {
  assertUser(input.userId);
  const day = getMutableDay(input.currentInstanceDayId);
  const exercise = day.exercises.find(
    (item) => item.plannedExerciseId === input.plannedExerciseId
  );

  if (exercise == null) {
    throw new Error('Planned exercise not found on current instance day.');
  }

  return exercise;
}

function getMutableDay(instanceDayId: number) {
  const day = currentInstance.days.find((item) => item.id === instanceDayId);

  if (day == null) {
    throw new Error('Current instance day not found.');
  }

  if (day.status !== 'PLANNED') {
    throw new Error('Only planned instance days can be modified.');
  }

  return day;
}

function getExerciseSnapshot(exerciseId: number) {
  const exercise = EXERCISES[exerciseId];

  if (exercise == null) {
    throw new Error('Exercise not found in mock catalog.');
  }

  return cloneExerciseSnapshot(exercise);
}

function upsertSet(
  sets: CurrentInstancePerformedSet[],
  input: LogSetForPlannedExerciseInput['set']
) {
  const existingSet = sets.find((set) => set.setOrder === input.setOrder);

  if (existingSet != null) {
    existingSet.weight = input.weight;
    existingSet.reps = input.reps;
    existingSet.completed = input.completed;
    return;
  }

  sets.push({
    id: nextSetId++,
    setOrder: input.setOrder,
    weight: input.weight,
    reps: input.reps,
    completed: input.completed,
  });

  sets.sort((a, b) => a.setOrder - b.setOrder);
}

function assertUser(userId: number) {
  if (userId !== currentInstance.userId) {
    throw new Error('Current instance not found for user.');
  }
}

function cloneCurrentInstance(
  instance: CurrentMesocycleInstanceDetails
): CurrentMesocycleInstanceDetails {
  return {
    ...instance,
    startDate: new Date(instance.startDate),
    endDate: instance.endDate ? new Date(instance.endDate) : null,
    days: instance.days.map(cloneCurrentInstanceDay),
  };
}

function cloneCurrentInstanceDay(day: CurrentInstanceDay): CurrentInstanceDay {
  return {
    ...day,
    endDate: day.endDate ? new Date(day.endDate) : null,
    exercises: day.exercises.map(cloneCurrentInstanceExercise),
    addedExercises: day.addedExercises.map(clonePerformedExercise),
  };
}

function cloneCurrentInstanceExercise(
  exercise: CurrentInstanceExercise
): CurrentInstanceExercise {
  return {
    ...exercise,
    templateExercise: cloneExerciseSnapshot(exercise.templateExercise),
    performedSets: clonePerformedSets(exercise.performedSets),
    performedExercise: exercise.performedExercise
      ? clonePerformedExercise(exercise.performedExercise)
      : null,
    previousSets: clonePreviousSets(exercise.previousSets),
    previousPerformance: exercise.previousPerformance
      ? {
          instanceDayId: exercise.previousPerformance.instanceDayId,
          performedExercise: {
            ...exercise.previousPerformance.performedExercise,
            exercise: cloneExerciseSnapshot(
              exercise.previousPerformance.performedExercise.exercise
            ),
            sets: clonePreviousSets(
              exercise.previousPerformance.performedExercise.sets
            ),
          },
        }
      : null,
  };
}

function clonePerformedExercise(
  exercise: CurrentInstancePerformedExercise
): CurrentInstancePerformedExercise {
  return {
    ...exercise,
    exercise: cloneExerciseSnapshot(exercise.exercise),
    sets: clonePerformedSets(exercise.sets),
  };
}

function cloneExerciseSnapshot(
  exercise: CurrentInstanceExerciseSnapshot
): CurrentInstanceExerciseSnapshot {
  return { ...exercise };
}

function clonePerformedSets(sets: CurrentInstancePerformedSet[]) {
  return sets.map((set) => ({ ...set }));
}

function clonePreviousSets(
  sets: Array<CurrentInstancePreviousSet | CurrentInstancePerformedSet>
) {
  return sets.map((set) => ({ ...set }));
}

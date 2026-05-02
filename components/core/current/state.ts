import type {
  CurrentInstanceExercise,
  CurrentInstancePerformedExercise,
  PerformedExerciseStatus,
} from '../../../db/repository/current_repository';
import type { ExerciseCatalogListItem } from '../../../lib/core/types';

export type CurrentInstanceExerciseRow = {
  key: string;
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise;
};

export type CurrentInstanceExerciseSubmissionDraft = {
  disposition: 'active' | 'skipped' | 'deleted';
  replacementExercise: ExerciseCatalogListItem | null;
  replacementRepeatsUntilMesocycleEnd: boolean;
  sets: CurrentInstanceExerciseSubmissionSetDraft[];
};

export type CurrentInstanceExerciseSubmissionSetDraft = {
  setOrder: number;
  weight: string;
  reps: string;
  completed: boolean;
  status: 'active' | 'skipped';
};

export type FinishCurrentInstanceDayPayload = {
  instanceDay: {
    instanceDayId: number;
    status: 'COMPLETED';
  };
  performedExercises: FinishCurrentInstanceDayPerformedExercise[];
};

export type FinishCurrentInstanceDayPerformedExercise = {
  instanceDayId: number;
  plannedExerciseId: number | null;
  exerciseId: number;
  exerciseOrder: number;
  status: PerformedExerciseStatus;
  replaceOnTemplate: boolean;
  performedSets: FinishCurrentInstanceDayPerformedSet[];
};

export type FinishCurrentInstanceDayPerformedSet = {
  setOrder: number;
  weight: number;
  reps: number;
  isCompleted: true;
};

export type BuildFinishCurrentInstanceDayPayloadResult =
  | {
      status: 'success';
      payload: FinishCurrentInstanceDayPayload;
    }
  | {
      status: 'error';
      errors: string[];
    };

export function createCurrentInstanceExerciseRows(
  exercises: CurrentInstanceExercise[],
  addedExercises: CurrentInstancePerformedExercise[]
): CurrentInstanceExerciseRow[] {
  return renumberExerciseRows(
    [
      ...exercises.map((exercise) => ({
        exercise,
        key: `planned-${exercise.plannedExerciseId}`,
      })),
      ...addedExercises.map((exercise) => ({
        exercise,
        key: `added-${exercise.id}`,
      })),
    ].sort((a, b) => a.exercise.exerciseOrder - b.exercise.exerciseOrder)
  );
}

export function insertExerciseRowBelow(
  rows: CurrentInstanceExerciseRow[],
  afterExerciseKey: string,
  exercise: CurrentInstancePerformedExercise
): CurrentInstanceExerciseRow[] {
  const afterExerciseIndex = rows.findIndex(
    (row) => row.key === afterExerciseKey
  );
  const insertionIndex =
    afterExerciseIndex === -1 ? rows.length : afterExerciseIndex + 1;

  return renumberExerciseRows([
    ...rows.slice(0, insertionIndex),
    {
      exercise,
      key: `added-${exercise.id}`,
    },
    ...rows.slice(insertionIndex),
  ]);
}

export function buildFinishCurrentInstanceDayPayload({
  currentInstanceDayId,
  exerciseRows,
  exerciseDrafts,
}: {
  currentInstanceDayId: number;
  exerciseRows: CurrentInstanceExerciseRow[];
  exerciseDrafts: Record<string, CurrentInstanceExerciseSubmissionDraft>;
}): BuildFinishCurrentInstanceDayPayloadResult {
  const errors: string[] = [];
  const performedExercises = exerciseRows.flatMap((row) => {
    const draft =
      exerciseDrafts[row.key] ?? createDefaultSubmissionDraft(row.exercise);

    if (draft.disposition === 'deleted') {
      return [];
    }

    const completedSets = draft.sets.filter(
      (set) => set.status === 'active' && set.completed
    );
    const performedSets = completedSets.map((set) => {
      const weight = parseDatabaseInteger(set.weight);
      const reps = parseDatabaseInteger(set.reps);

      if (weight == null) {
        errors.push(
          `Exercise ${row.exercise.exerciseOrder + 1}, set ${
            set.setOrder
          } needs a whole-number weight before it can be submitted.`
        );
      }

      if (reps == null) {
        errors.push(
          `Exercise ${row.exercise.exerciseOrder + 1}, set ${
            set.setOrder
          } needs whole-number reps before it can be submitted.`
        );
      }

      return {
        setOrder: set.setOrder,
        weight: weight ?? 0,
        reps: reps ?? 0,
        isCompleted: true as const,
      };
    });

    const status = getPerformedExerciseStatus(row.exercise, draft);

    if (status === 'COMPLETED' && performedSets.length === 0) {
      return [];
    }

    return [
      {
        instanceDayId: currentInstanceDayId,
        plannedExerciseId: getPlannedExerciseId(row.exercise),
        exerciseId: getSubmittedExerciseId(row.exercise, draft),
        exerciseOrder: row.exercise.exerciseOrder,
        status,
        replaceOnTemplate:
          isTemplateExercise(row.exercise) &&
          draft.replacementExercise != null &&
          draft.replacementRepeatsUntilMesocycleEnd,
        performedSets,
      },
    ];
  });

  if (errors.length > 0) {
    return {
      status: 'error',
      errors,
    };
  }

  return {
    status: 'success',
    payload: {
      instanceDay: {
        instanceDayId: currentInstanceDayId,
        status: 'COMPLETED',
      },
      performedExercises,
    },
  };
}

export function createDefaultSubmissionDraft(
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise
): CurrentInstanceExerciseSubmissionDraft {
  return {
    disposition: 'active',
    replacementExercise: null,
    replacementRepeatsUntilMesocycleEnd: false,
    sets: getSubmittedSets(exercise),
  };
}

export function areSubmissionDraftsEqual(
  a: CurrentInstanceExerciseSubmissionDraft | undefined,
  b: CurrentInstanceExerciseSubmissionDraft
) {
  if (a == null) {
    return false;
  }

  return JSON.stringify(a) === JSON.stringify(b);
}

function renumberExerciseRows(
  rows: CurrentInstanceExerciseRow[]
): CurrentInstanceExerciseRow[] {
  return rows.map((row, exerciseOrder) => ({
    ...row,
    exercise: {
      ...row.exercise,
      exerciseOrder,
    },
  }));
}

function getPerformedExerciseStatus(
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise,
  draft: CurrentInstanceExerciseSubmissionDraft
): PerformedExerciseStatus {
  if (draft.disposition === 'skipped') {
    return 'SKIPPED';
  }

  if (!isTemplateExercise(exercise)) {
    return 'ADDED';
  }

  if (
    draft.replacementExercise != null ||
    exercise.performedExerciseStatus === 'REPLACED'
  ) {
    return 'REPLACED';
  }

  return 'COMPLETED';
}

function getSubmittedExerciseId(
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise,
  draft: CurrentInstanceExerciseSubmissionDraft
) {
  if (draft.replacementExercise != null) {
    return draft.replacementExercise.id;
  }

  if (isTemplateExercise(exercise)) {
    return exercise.performedExercise?.exercise.id ?? exercise.templateExercise.id;
  }

  return exercise.exercise.id;
}

function getPlannedExerciseId(
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise
) {
  return isTemplateExercise(exercise) ? exercise.plannedExerciseId : null;
}

function getSubmittedSets(
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise
): CurrentInstanceExerciseSubmissionSetDraft[] {
  const sets = isTemplateExercise(exercise)
    ? exercise.performedSets
    : exercise.sets;

  return sets.map((set) => ({
    setOrder: set.setOrder,
    weight: String(set.weight),
    reps: String(set.reps),
    completed: set.completed,
    status: 'active',
  }));
}

function parseDatabaseInteger(value: string) {
  if (value.trim() === '') {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

function isTemplateExercise(
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise
): exercise is CurrentInstanceExercise {
  return 'source' in exercise;
}

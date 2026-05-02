import type {
  CurrentInstanceExercise,
  CurrentInstancePerformedExercise,
} from '../../../db/repository/current_repository';

export type CurrentInstanceExerciseRow = {
  key: string;
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise;
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

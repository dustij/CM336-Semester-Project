import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createCurrentInstanceExerciseRows,
  insertExerciseRowBelow,
} from '../components/core/current/state.ts';

const plannedExercise = (plannedExerciseId, exerciseOrder, name) => ({
  source: 'TEMPLATE',
  plannedExerciseId,
  exerciseId: plannedExerciseId,
  name,
  equipment: null,
  muscleGroup: null,
  exerciseOrder,
  performedExerciseId: null,
  performedExerciseStatus: null,
  performedSets: [],
  templateExercise: {
    id: plannedExerciseId,
    name,
    equipment: null,
    muscleGroup: null,
  },
  performedExercise: null,
  previousInstanceDayId: null,
  previousPerformedExerciseId: null,
  previousSets: [],
  previousPerformance: null,
});

const addedExercise = (id, exerciseOrder, name) => ({
  id,
  plannedExerciseId: null,
  exerciseOrder,
  status: 'ADDED',
  exercise: {
    id: Math.abs(id),
    name,
    equipment: null,
    muscleGroup: null,
  },
  sets: [],
});

test('insertExerciseRowBelow inserts directly below the selected planned exercise and renumbers rows', () => {
  const rows = createCurrentInstanceExerciseRows(
    [
      plannedExercise(10, 0, 'Bench Press'),
      plannedExercise(11, 1, 'Shoulder Press'),
    ],
    []
  );

  const updatedRows = insertExerciseRowBelow(
    rows,
    'planned-10',
    addedExercise(-1, 0, 'Incline Bench Press')
  );

  assert.deepEqual(
    updatedRows.map((row) => [row.key, row.exercise.exerciseOrder]),
    [
      ['planned-10', 0],
      ['added--1', 1],
      ['planned-11', 2],
    ]
  );
});

test('insertExerciseRowBelow inserts directly below an already-added exercise', () => {
  const rows = insertExerciseRowBelow(
    createCurrentInstanceExerciseRows(
      [
        plannedExercise(10, 0, 'Bench Press'),
        plannedExercise(11, 1, 'Shoulder Press'),
      ],
      []
    ),
    'planned-10',
    addedExercise(-1, 0, 'Incline Bench Press')
  );

  const updatedRows = insertExerciseRowBelow(
    rows,
    'added--1',
    addedExercise(-2, 0, 'Cable Fly')
  );

  assert.deepEqual(
    updatedRows.map((row) => [row.key, row.exercise.exerciseOrder]),
    [
      ['planned-10', 0],
      ['added--1', 1],
      ['added--2', 2],
      ['planned-11', 3],
    ]
  );
});

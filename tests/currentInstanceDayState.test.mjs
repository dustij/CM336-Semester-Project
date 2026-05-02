import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildFinishCurrentInstanceDayPayload,
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

test('buildFinishCurrentInstanceDayPayload maps completed sets and ignores uncompleted sets', () => {
  const rows = createCurrentInstanceExerciseRows(
    [plannedExercise(10, 0, 'Bench Press')],
    []
  );

  const result = buildFinishCurrentInstanceDayPayload({
    currentInstanceDayId: 4,
    exerciseRows: rows,
    exerciseDrafts: {
      'planned-10': {
        disposition: 'active',
        replacementExercise: null,
        replacementRepeatsUntilMesocycleEnd: false,
        sets: [
          {
            setOrder: 1,
            weight: '135',
            reps: '8',
            completed: true,
            status: 'active',
          },
          {
            setOrder: 2,
            weight: '135',
            reps: '8',
            completed: false,
            status: 'active',
          },
        ],
      },
    },
  });

  assert.equal(result.status, 'success');
  assert.deepEqual(result.payload, {
    instanceDay: {
      instanceDayId: 4,
      status: 'COMPLETED',
    },
    performedExercises: [
      {
        instanceDayId: 4,
        plannedExerciseId: 10,
        exerciseId: 10,
        exerciseOrder: 0,
        status: 'COMPLETED',
        replaceOnTemplate: false,
        performedSets: [
          {
            setOrder: 1,
            weight: 135,
            reps: 8,
            isCompleted: true,
          },
        ],
      },
    ],
  });
});

test('buildFinishCurrentInstanceDayPayload maps skipped, replaced, and added exercises', () => {
  const rows = insertExerciseRowBelow(
    createCurrentInstanceExerciseRows(
      [
        plannedExercise(10, 0, 'Bench Press'),
        plannedExercise(11, 1, 'Shoulder Press'),
      ],
      []
    ),
    'planned-10',
    addedExercise(-1, 0, 'Cable Fly')
  );

  const result = buildFinishCurrentInstanceDayPayload({
    currentInstanceDayId: 4,
    exerciseRows: rows,
    exerciseDrafts: {
      'planned-10': {
        disposition: 'active',
        replacementExercise: {
          id: 99,
          name: 'Incline Bench Press',
          equipment: 'Barbell',
          muscleGroup: 'Chest',
        },
        replacementRepeatsUntilMesocycleEnd: true,
        sets: [],
      },
      'added--1': {
        disposition: 'active',
        replacementExercise: null,
        replacementRepeatsUntilMesocycleEnd: false,
        sets: [
          {
            setOrder: 1,
            weight: '25',
            reps: '12',
            completed: true,
            status: 'active',
          },
        ],
      },
      'planned-11': {
        disposition: 'skipped',
        replacementExercise: null,
        replacementRepeatsUntilMesocycleEnd: false,
        sets: [],
      },
    },
  });

  assert.equal(result.status, 'success');
  assert.deepEqual(
    result.payload.performedExercises.map(
      ({
        plannedExerciseId,
        exerciseId,
        exerciseOrder,
        status,
        replaceOnTemplate,
        performedSets,
      }) => ({
        plannedExerciseId,
        exerciseId,
        exerciseOrder,
        status,
        replaceOnTemplate,
        performedSets,
      })
    ),
    [
      {
        plannedExerciseId: 10,
        exerciseId: 99,
        exerciseOrder: 0,
        status: 'REPLACED',
        replaceOnTemplate: true,
        performedSets: [],
      },
      {
        plannedExerciseId: null,
        exerciseId: 1,
        exerciseOrder: 1,
        status: 'ADDED',
        replaceOnTemplate: false,
        performedSets: [
          {
            setOrder: 1,
            weight: 25,
            reps: 12,
            isCompleted: true,
          },
        ],
      },
      {
        plannedExerciseId: 11,
        exerciseId: 11,
        exerciseOrder: 2,
        status: 'SKIPPED',
        replaceOnTemplate: false,
        performedSets: [],
      },
    ]
  );
});

test('buildFinishCurrentInstanceDayPayload returns validation errors for invalid completed sets', () => {
  const rows = createCurrentInstanceExerciseRows(
    [plannedExercise(10, 0, 'Bench Press')],
    []
  );

  const result = buildFinishCurrentInstanceDayPayload({
    currentInstanceDayId: 4,
    exerciseRows: rows,
    exerciseDrafts: {
      'planned-10': {
        disposition: 'active',
        replacementExercise: null,
        replacementRepeatsUntilMesocycleEnd: false,
        sets: [
          {
            setOrder: 1,
            weight: '',
            reps: '8.5',
            completed: true,
            status: 'active',
          },
        ],
      },
    },
  });

  assert.equal(result.status, 'error');
  assert.deepEqual(result.errors, [
    'Exercise 1, set 1 needs a whole-number weight before it can be submitted.',
    'Exercise 1, set 1 needs whole-number reps before it can be submitted.',
  ]);
});

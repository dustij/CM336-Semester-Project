import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildFinishCurrentInstanceDayPayload,
  createDefaultSubmissionDraft,
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

const addedExercise = (id, exerciseOrder, name, overrides = {}) => ({
  id,
  plannedExerciseId: null,
  exerciseOrder,
  repeatUntilMesocycleEnd: overrides.repeatUntilMesocycleEnd ?? false,
  status: 'ADDED',
  exercise: {
    id: Math.abs(id),
    name,
    equipment: null,
    muscleGroup: null,
  },
  sets: overrides.sets ?? [],
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

test('buildFinishCurrentInstanceDayPayload maps completed and skipped sets while ignoring uncompleted active sets', () => {
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
          {
            setOrder: 3,
            weight: '135',
            reps: '8',
            completed: false,
            status: 'skipped',
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
        repeatUntilMesocycleEnd: false,
        performedSets: [
          {
            setOrder: 1,
            weight: 135,
            reps: 8,
            isCompleted: true,
          },
          {
            setOrder: 3,
            weight: 135,
            reps: 8,
            isCompleted: false,
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
        repeatUntilMesocycleEnd,
        performedSets,
      }) => ({
        plannedExerciseId,
        exerciseId,
        exerciseOrder,
        status,
        repeatUntilMesocycleEnd,
        performedSets,
      })
    ),
    [
      {
        plannedExerciseId: 10,
        exerciseId: 99,
        exerciseOrder: 0,
        status: 'REPLACED',
        repeatUntilMesocycleEnd: true,
        performedSets: [],
      },
      {
        plannedExerciseId: null,
        exerciseId: 1,
        exerciseOrder: 1,
        status: 'ADDED',
        repeatUntilMesocycleEnd: false,
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
        repeatUntilMesocycleEnd: false,
        performedSets: [],
      },
    ]
  );
});

test('buildFinishCurrentInstanceDayPayload keeps repeat flag for added exercises', () => {
  const rows = createCurrentInstanceExerciseRows(
    [],
    [
      addedExercise(-1, 0, 'Decline Sit-Up', {
        repeatUntilMesocycleEnd: true,
      }),
    ]
  );

  const result = buildFinishCurrentInstanceDayPayload({
    currentInstanceDayId: 4,
    exerciseRows: rows,
    exerciseDrafts: {
      'added--1': {
        disposition: 'active',
        replacementExercise: null,
        replacementRepeatsUntilMesocycleEnd: false,
        sets: [
          {
            setOrder: 1,
            weight: '0',
            reps: '15',
            completed: true,
            status: 'active',
          },
        ],
      },
    },
  });

  assert.equal(result.status, 'success');
  assert.deepEqual(result.payload.performedExercises[0], {
    instanceDayId: 4,
    plannedExerciseId: null,
    exerciseId: 1,
    exerciseOrder: 0,
    status: 'ADDED',
    repeatUntilMesocycleEnd: true,
    performedSets: [
      {
        setOrder: 1,
        weight: 0,
        reps: 15,
        isCompleted: true,
      },
    ],
  });
});

test('buildFinishCurrentInstanceDayPayload carries a previous repeated replacement forward', () => {
  const exercise = plannedExercise(10, 0, 'Bench Press');
  exercise.previousInstanceDayId = 2;
  exercise.previousPerformedExerciseId = 20;
  exercise.previousPerformance = {
    instanceDayId: 2,
    performedExercise: {
      id: 20,
      plannedExerciseId: 10,
      exerciseOrder: 0,
      repeatUntilMesocycleEnd: true,
      status: 'REPLACED',
      exercise: {
        id: 99,
        name: 'Incline Bench Press',
        equipment: 'Barbell',
        muscleGroup: 'Chest',
      },
      sets: [],
    },
  };

  const rows = createCurrentInstanceExerciseRows([exercise], []);
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
        ],
      },
    },
  });

  assert.equal(result.status, 'success');
  assert.deepEqual(result.payload.performedExercises[0], {
    instanceDayId: 4,
    plannedExerciseId: 10,
    exerciseId: 99,
    exerciseOrder: 0,
    status: 'REPLACED',
    repeatUntilMesocycleEnd: true,
    performedSets: [
      {
        setOrder: 1,
        weight: 135,
        reps: 8,
        isCompleted: true,
      },
    ],
  });
});

test('buildFinishCurrentInstanceDayPayload drops the repeat flag for skipped exercises', () => {
  const exercise = plannedExercise(10, 0, 'Bench Press');
  exercise.previousPerformance = {
    instanceDayId: 2,
    performedExercise: {
      id: 20,
      plannedExerciseId: 10,
      exerciseOrder: 0,
      repeatUntilMesocycleEnd: true,
      status: 'REPLACED',
      exercise: {
        id: 99,
        name: 'Incline Bench Press',
        equipment: 'Barbell',
        muscleGroup: 'Chest',
      },
      sets: [],
    },
  };

  const result = buildFinishCurrentInstanceDayPayload({
    currentInstanceDayId: 4,
    exerciseRows: createCurrentInstanceExerciseRows([exercise], []),
    exerciseDrafts: {
      'planned-10': {
        disposition: 'skipped',
        replacementExercise: null,
        replacementRepeatsUntilMesocycleEnd: false,
        sets: [],
      },
    },
  });

  assert.equal(result.status, 'success');
  assert.equal(result.payload.performedExercises[0].status, 'SKIPPED');
  assert.equal(
    result.payload.performedExercises[0].repeatUntilMesocycleEnd,
    false
  );
});

test('createDefaultSubmissionDraft prefills template sets from the prior week', () => {
  const exercise = plannedExercise(10, 0, 'Bench Press');
  exercise.previousSets = [
    {
      id: 2,
      setOrder: 2,
      weight: 140,
      reps: 7,
      completed: true,
    },
    {
      id: 1,
      setOrder: 1,
      weight: 135,
      reps: 8,
      completed: true,
    },
  ];

  assert.deepEqual(createDefaultSubmissionDraft(exercise).sets, [
    {
      setOrder: 1,
      weight: '135',
      reps: '8',
      completed: false,
      status: 'active',
    },
    {
      setOrder: 2,
      weight: '140',
      reps: '7',
      completed: false,
      status: 'active',
    },
  ]);
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

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addMuscleGroupToDay,
  removePlannedExerciseFromDay,
  updateMesocycleDayOfWeek,
  updatePlannedExerciseInDay,
} from '../components/core/mesocycles/builder/state.ts';

const plannedExercise = (muscleGroup, exerciseOrder, overrides = {}) => ({
  id: exerciseOrder,
  name: muscleGroup,
  equipment: '',
  exerciseOrder,
  exerciseType: '',
  muscleGroup,
  ...overrides,
});

test('addMuscleGroupToDay appends a planned exercise with the next exerciseOrder', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [
        plannedExercise('Chest', 0),
        plannedExercise('Shoulders', 1),
      ],
    },
    {
      dayOfWeek: 'Tuesday',
      dayOrder: 1,
      plannedExercises: [plannedExercise('Back', 0)],
    },
  ];

  const updatedDays = addMuscleGroupToDay(mesocycleDays, 0, 'Triceps');

  assert.deepEqual(updatedDays[0].plannedExercises, [
    plannedExercise('Chest', 0),
    plannedExercise('Shoulders', 1),
    {
      id: null,
      name: null,
      equipment: null,
      exerciseOrder: 2,
      exerciseType: '',
      muscleGroup: 'Triceps',
    },
  ]);
  assert.equal(updatedDays[1], mesocycleDays[1]);
});

test('removePlannedExerciseFromDay reindexes exerciseOrder after removing a planned exercise', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [
        plannedExercise('Chest', 0),
        plannedExercise('Shoulders', 1),
        plannedExercise('Triceps', 2),
      ],
    },
    {
      dayOfWeek: 'Tuesday',
      dayOrder: 1,
      plannedExercises: [plannedExercise('Back', 0)],
    },
  ];

  const updatedDays = removePlannedExerciseFromDay(mesocycleDays, 0, 1);

  assert.deepEqual(
    updatedDays[0].plannedExercises.map(({ muscleGroup, exerciseOrder }) => ({
      muscleGroup,
      exerciseOrder,
    })),
    [
      { muscleGroup: 'Chest', exerciseOrder: 0 },
      { muscleGroup: 'Triceps', exerciseOrder: 1 },
    ]
  );
  assert.equal(mesocycleDays[0].plannedExercises[2].exerciseOrder, 2);
  assert.equal(updatedDays[1], mesocycleDays[1]);
});

test('updateMesocycleDayOfWeek updates only the targeted day', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [plannedExercise('Chest', 0)],
    },
    {
      dayOfWeek: null,
      dayOrder: 1,
      plannedExercises: [plannedExercise('Back', 0)],
    },
  ];

  const updatedDays = updateMesocycleDayOfWeek(mesocycleDays, 1, 'Wednesday');

  assert.equal(updatedDays[0], mesocycleDays[0]);
  assert.deepEqual(updatedDays[1], {
    dayOfWeek: 'Wednesday',
    dayOrder: 1,
    plannedExercises: [plannedExercise('Back', 0)],
  });
});

test('updatePlannedExerciseInDay updates only the targeted planned exercise', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [
        plannedExercise('Chest', 0, {
          id: null,
          name: null,
          equipment: null,
        }),
        plannedExercise('Shoulders', 1),
      ],
    },
    {
      dayOfWeek: 'Tuesday',
      dayOrder: 1,
      plannedExercises: [plannedExercise('Back', 0)],
    },
  ];

  const updatedDays = updatePlannedExerciseInDay(mesocycleDays, 0, 0, {
    ...mesocycleDays[0].plannedExercises[0],
    id: 42,
    name: 'Incline Bench Press',
    equipment: 'Barbell',
  });

  assert.deepEqual(updatedDays[0].plannedExercises[0], {
    id: 42,
    name: 'Incline Bench Press',
    equipment: 'Barbell',
    exerciseOrder: 0,
    exerciseType: '',
    muscleGroup: 'Chest',
  });
  assert.equal(updatedDays[0].plannedExercises[1], mesocycleDays[0].plannedExercises[1]);
  assert.equal(updatedDays[1], mesocycleDays[1]);
});

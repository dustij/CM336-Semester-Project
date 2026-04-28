import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addDayToMesocycleTemplate,
  addMuscleGroupToDay,
  duplicateDayInMesocycleTemplate,
  moveDayInMesocycleTemplate,
  movePlannedExerciseInDay,
  removeDayFromMesocycleTemplate,
  removePlannedExerciseFromDay,
  changePlannedExerciseMuscleGroupInDay,
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

test('movePlannedExerciseInDay reorders planned exercises and reindexes exerciseOrder', () => {
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

  const updatedDays = movePlannedExerciseInDay(mesocycleDays, 0, 2, 0);

  assert.deepEqual(
    updatedDays[0].plannedExercises.map(({ muscleGroup, exerciseOrder }) => ({
      muscleGroup,
      exerciseOrder,
    })),
    [
      { muscleGroup: 'Triceps', exerciseOrder: 0 },
      { muscleGroup: 'Chest', exerciseOrder: 1 },
      { muscleGroup: 'Shoulders', exerciseOrder: 2 },
    ]
  );
  assert.equal(mesocycleDays[0].plannedExercises[2].exerciseOrder, 2);
  assert.equal(updatedDays[1], mesocycleDays[1]);
});

test('movePlannedExerciseInDay returns the same list for no-op or invalid moves', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [plannedExercise('Chest', 0)],
    },
  ];

  assert.equal(movePlannedExerciseInDay(mesocycleDays, 0, 0, 0), mesocycleDays);
  assert.equal(movePlannedExerciseInDay(mesocycleDays, 0, -1, 0), mesocycleDays);
  assert.equal(movePlannedExerciseInDay(mesocycleDays, 0, 0, 1), mesocycleDays);
  assert.equal(movePlannedExerciseInDay(mesocycleDays, 1, 0, 0), mesocycleDays);
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

test('changePlannedExerciseMuscleGroupInDay replaces muscle group and clears the selected exercise', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [
        plannedExercise('Chest', 0, {
          id: 42,
          name: 'Incline Bench Press',
          equipment: 'Barbell',
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

  const updatedDays = changePlannedExerciseMuscleGroupInDay(
    mesocycleDays,
    0,
    0,
    'Triceps'
  );

  assert.deepEqual(updatedDays[0].plannedExercises[0], {
    id: null,
    name: null,
    equipment: null,
    exerciseOrder: 0,
    exerciseType: '',
    muscleGroup: 'Triceps',
  });
  assert.equal(updatedDays[0].plannedExercises[1], mesocycleDays[0].plannedExercises[1]);
  assert.equal(updatedDays[1], mesocycleDays[1]);
});

test('addDayToMesocycleTemplate appends a blank day with the next dayOrder', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [plannedExercise('Chest', 0)],
    },
    {
      dayOfWeek: 'Wednesday',
      dayOrder: 3,
      plannedExercises: [plannedExercise('Back', 0)],
    },
  ];

  const updatedDays = addDayToMesocycleTemplate(mesocycleDays);

  assert.equal(updatedDays.length, 3);
  assert.equal(updatedDays[0], mesocycleDays[0]);
  assert.equal(updatedDays[1], mesocycleDays[1]);
  assert.deepEqual(updatedDays[2], {
    dayOfWeek: null,
    dayOrder: 4,
    plannedExercises: [],
  });
});

test('addDayToMesocycleTemplate returns the same list after seven days', () => {
  const mesocycleDays = Array.from({ length: 7 }, (_, index) => ({
    dayOfWeek: 'Monday',
    dayOrder: index,
    plannedExercises: [],
  }));

  const updatedDays = addDayToMesocycleTemplate(mesocycleDays);

  assert.equal(updatedDays, mesocycleDays);
});

test('removeDayFromMesocycleTemplate removes a day and reindexes dayOrder', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [plannedExercise('Chest', 0)],
    },
    {
      dayOfWeek: 'Wednesday',
      dayOrder: 1,
      plannedExercises: [plannedExercise('Back', 0)],
    },
    {
      dayOfWeek: 'Friday',
      dayOrder: 2,
      plannedExercises: [plannedExercise('Legs', 0)],
    },
  ];

  const updatedDays = removeDayFromMesocycleTemplate(mesocycleDays, 1);

  assert.deepEqual(
    updatedDays.map(({ dayOfWeek, dayOrder }) => ({ dayOfWeek, dayOrder })),
    [
      { dayOfWeek: 'Monday', dayOrder: 0 },
      { dayOfWeek: 'Friday', dayOrder: 1 },
    ]
  );
  assert.equal(mesocycleDays[2].dayOrder, 2);
});

test('removeDayFromMesocycleTemplate can remove the first day and reindex dayOrder', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [],
    },
    {
      dayOfWeek: 'Tuesday',
      dayOrder: 1,
      plannedExercises: [],
    },
  ];

  const updatedDays = removeDayFromMesocycleTemplate(mesocycleDays, 0);

  assert.deepEqual(
    updatedDays.map(({ dayOfWeek, dayOrder }) => ({ dayOfWeek, dayOrder })),
    [{ dayOfWeek: 'Tuesday', dayOrder: 0 }]
  );
  assert.equal(mesocycleDays[1].dayOrder, 1);
});

test('removeDayFromMesocycleTemplate keeps the only day or invalid day indexes', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [],
    },
  ];

  assert.equal(removeDayFromMesocycleTemplate(mesocycleDays, 0), mesocycleDays);
  assert.equal(removeDayFromMesocycleTemplate(mesocycleDays, -1), mesocycleDays);
  assert.equal(removeDayFromMesocycleTemplate(mesocycleDays, 1), mesocycleDays);
});

test('moveDayInMesocycleTemplate reorders days and reindexes dayOrder', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [plannedExercise('Chest', 0)],
    },
    {
      dayOfWeek: 'Wednesday',
      dayOrder: 1,
      plannedExercises: [plannedExercise('Back', 0)],
    },
    {
      dayOfWeek: 'Friday',
      dayOrder: 2,
      plannedExercises: [plannedExercise('Legs', 0)],
    },
  ];

  const updatedDays = moveDayInMesocycleTemplate(mesocycleDays, 2, 1);

  assert.deepEqual(
    updatedDays.map(({ dayOfWeek, dayOrder }) => ({ dayOfWeek, dayOrder })),
    [
      { dayOfWeek: 'Monday', dayOrder: 0 },
      { dayOfWeek: 'Friday', dayOrder: 1 },
      { dayOfWeek: 'Wednesday', dayOrder: 2 },
    ]
  );
  assert.equal(mesocycleDays[2].dayOrder, 2);
});

test('moveDayInMesocycleTemplate returns the same list for no-op or invalid moves', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [],
    },
    {
      dayOfWeek: 'Tuesday',
      dayOrder: 1,
      plannedExercises: [],
    },
  ];

  assert.equal(moveDayInMesocycleTemplate(mesocycleDays, 0, 0), mesocycleDays);
  assert.equal(moveDayInMesocycleTemplate(mesocycleDays, -1, 0), mesocycleDays);
  assert.equal(moveDayInMesocycleTemplate(mesocycleDays, 0, -1), mesocycleDays);
  assert.equal(moveDayInMesocycleTemplate(mesocycleDays, 2, 0), mesocycleDays);
  assert.equal(moveDayInMesocycleTemplate(mesocycleDays, 0, 2), mesocycleDays);
});

test('duplicateDayInMesocycleTemplate duplicates a day after the source day and reindexes dayOrder', () => {
  const mesocycleDays = [
    {
      dayOfWeek: 'Monday',
      dayOrder: 0,
      plannedExercises: [plannedExercise('Chest', 0)],
    },
    {
      dayOfWeek: 'Wednesday',
      dayOrder: 1,
      plannedExercises: [plannedExercise('Back', 0)],
    },
  ];

  const updatedDays = duplicateDayInMesocycleTemplate(mesocycleDays, 0);

  assert.deepEqual(
    updatedDays.map(({ dayOfWeek, dayOrder }) => ({ dayOfWeek, dayOrder })),
    [
      { dayOfWeek: 'Monday', dayOrder: 0 },
      { dayOfWeek: null, dayOrder: 1 },
      { dayOfWeek: 'Wednesday', dayOrder: 2 },
    ]
  );
  assert.deepEqual(updatedDays[1].plannedExercises, [
    plannedExercise('Chest', 0),
  ]);
  assert.notEqual(updatedDays[1].plannedExercises[0], mesocycleDays[0].plannedExercises[0]);
  assert.equal(mesocycleDays[1].dayOrder, 1);
});

test('duplicateDayInMesocycleTemplate returns the same list at seven days or with an invalid index', () => {
  const mesocycleDays = Array.from({ length: 7 }, (_, index) => ({
    dayOfWeek: 'Monday',
    dayOrder: index,
    plannedExercises: [],
  }));

  assert.equal(duplicateDayInMesocycleTemplate(mesocycleDays, 0), mesocycleDays);

  const shorterMesocycleDays = mesocycleDays.slice(0, 2);

  assert.equal(
    duplicateDayInMesocycleTemplate(shorterMesocycleDays, -1),
    shorterMesocycleDays
  );
  assert.equal(
    duplicateDayInMesocycleTemplate(shorterMesocycleDays, 2),
    shorterMesocycleDays
  );
});

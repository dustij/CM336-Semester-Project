import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addMuscleGroupToDay,
  removePlannedExerciseFromDay,
} from '../components/core/newMesocyclePageState.ts';

const plannedExercise = (muscleGroup, exerciseOrder) => ({
  exerciseId: exerciseOrder,
  exerciseName: muscleGroup,
  exerciseOrder,
  exerciseType: '',
  equipment: '',
  muscleGroup,
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
      exerciseId: 0,
      exerciseName: 'Triceps',
      exerciseOrder: 2,
      exerciseType: '',
      equipment: '',
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

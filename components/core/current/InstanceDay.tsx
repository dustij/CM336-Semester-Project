'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  type CurrentInstanceExercise,
  type CurrentInstancePerformedExercise,
} from '@/db/repository/current_repository';
import type { ExerciseCatalogListItem, Weekday } from '@/lib/core/types';
import { EllipsisVertical, SkipForward } from 'lucide-react';
import { useRef, useState } from 'react';
import InstanceExerciseCard from './InstanceExerciseCard';

type InstanceDayProps = {
  currentInstanceDayId: number;
  title: string;
  weekNumber: number;
  dayNumber: number;
  weekday: Weekday;
  exercises: CurrentInstanceExercise[];
  addedExercises: CurrentInstancePerformedExercise[];
};

export default function InstanceDay({
  currentInstanceDayId,
  title,
  weekNumber,
  dayNumber,
  weekday,
  exercises,
  addedExercises,
}: InstanceDayProps) {
  const nextLocalExerciseId = useRef(-1);
  const [localAddedExercises, setLocalAddedExercises] = useState(() =>
    [...addedExercises].sort((a, b) => a.exerciseOrder - b.exerciseOrder)
  );

  const exerciseRows = [
    ...exercises.map((exercise) => ({
      exercise,
      key: `planned-${exercise.plannedExerciseId}`,
      order: exercise.exerciseOrder,
    })),
    ...localAddedExercises.map((exercise) => ({
      exercise,
      key: `added-${exercise.id}`,
      order: exercise.exerciseOrder,
    })),
  ].sort((a, b) => a.order - b.order);

  const handleAddExerciseBelow = (
    afterExerciseOrder: number,
    exercise: ExerciseCatalogListItem
  ) => {
    const localExerciseId = nextLocalExerciseId.current--;

    setLocalAddedExercises((currentExercises) => [
      ...currentExercises,
      {
        id: localExerciseId,
        plannedExerciseId: null,
        exerciseOrder: afterExerciseOrder + Math.abs(localExerciseId) * 0.01,
        status: 'ADDED',
        exercise: {
          id: exercise.id,
          name: exercise.name,
          equipment: exercise.equipment,
          muscleGroup: exercise.muscleGroup,
        },
        sets: [],
      },
    ]);
  };

  return (
    <main className="bg-my-background flex flex-1 flex-col items-center">
      <div className="flex w-full items-center px-5 py-3.5">
        <div className="flex-1">
          <div>
            <p className="text-caption text-sm leading-tight">{title}</p>
          </div>
          <div>
            <p className="text-heading leading-tight font-semibold">
              Week {weekNumber} Day {dayNumber} {weekday}
            </p>
          </div>
        </div>
        {/* Options Button */}
        <div className="flex shrink items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonVariants({ variant: 'ghost', size: 'icon-xl' })}
              aria-label="Mesocycle options"
            >
              <EllipsisVertical className="text-body size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <DropdownMenuItem onClick={() => {}}>
                <SkipForward className="mr-2 size-4" />
                Skip Day
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex w-full flex-1 flex-col gap-4 overflow-hidden overflow-y-auto px-5">
        {exerciseRows.map(({ exercise, key }) => (
          <InstanceExerciseCard
            key={`${currentInstanceDayId}-${key}`}
            exercise={exercise}
            onAddExerciseBelow={handleAddExerciseBelow}
          />
        ))}
        <div className="mt-1 mb-5">
          <Button className="h-12 w-full text-base font-semibold" size="lg">
            Finish
          </Button>
        </div>
      </div>
    </main>
  );
}

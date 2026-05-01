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
import type { Weekday } from '@/lib/core/types';
import { EllipsisVertical, SkipForward } from 'lucide-react';
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
  const orderedAddedExercises = [...addedExercises].sort(
    (a, b) => a.exerciseOrder - b.exerciseOrder
  );
  const totalExercises = exercises.length + orderedAddedExercises.length;

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
                <SkipForward className="size-4" />
                Skip Day
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex w-full flex-1 flex-col gap-4 overflow-hidden overflow-y-auto px-5">
        {exercises.map((exercise, index) => (
          <InstanceExerciseCard
            key={`${currentInstanceDayId}-planned-${exercise.plannedExerciseId}`}
            exercise={exercise}
            isMoveUpDisabled={index === 0}
            isMoveDownDisabled={index === totalExercises - 1}
          />
        ))}
        {orderedAddedExercises.map((exercise, index) => (
          <InstanceExerciseCard
            key={`${currentInstanceDayId}-added-${exercise.id}`}
            exercise={exercise}
            isMoveUpDisabled={exercises.length + index === 0}
            isMoveDownDisabled={exercises.length + index === totalExercises - 1}
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

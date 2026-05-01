'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CurrentInstanceExercise,
  CurrentInstancePerformedExercise,
} from '@/db/repository/current_repository';
import { Weekday } from '@/lib/core/types';
import { EllipsisVertical, SkipForward } from 'lucide-react';
import InstanceExerciseCard from './InstanceExerciseCard';

type InstanceDayProps = {
  title: string;
  weekNumber: number;
  dayNumber: number;
  weekday: Weekday;
  exercises: CurrentInstanceExercise[];
  addedExercises: CurrentInstancePerformedExercise[];
};

export default function InstanceDay({
  title,
  weekNumber,
  dayNumber,
  weekday,
  exercises,
  addedExercises,
}: InstanceDayProps) {
  return (
    <main className="bg-my-background flex flex-1 flex-col items-center justify-center">
      <div className="flex w-full items-center px-5 py-3.5">
        <div className="flex-1">
          <div>
            <p className="text-caption text-sm">{title}</p>
          </div>
          <div>
            <p className="text-body font-semibold">
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
      <div className="flex w-full flex-1 flex-col gap-2.5 overflow-hidden overflow-y-auto px-5">
        {exercises.map((exercise) => (
          <InstanceExerciseCard key={exercise.exerciseId} />
        ))}
        <div className="mt-2.5 mb-5">
          <Button className="w-full" size="lg">
            Finish
          </Button>
        </div>
      </div>
    </main>
  );
}

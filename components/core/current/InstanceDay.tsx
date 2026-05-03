'use client';

import {
  completeCurrentInstanceDayAction,
  getReplaceExerciseOptionsAction,
} from '@/app/(main)/current/actions';
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
import type {
  ExerciseCatalogListItem,
  ExercisesByMuscleGroup,
  Weekday,
} from '@/lib/core/types';
import { EllipsisVertical, SkipForward } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import InstanceExerciseCard from './InstanceExerciseCard';
import {
  areSubmissionDraftsEqual,
  buildFinishCurrentInstanceDayPayload,
  createCurrentInstanceExerciseRows,
  type CurrentInstanceExerciseSubmissionDraft,
  insertExerciseRowBelow,
} from './state';

type InstanceDayProps = {
  currentInstanceDayId: number;
  title: string;
  weekNumber: number;
  dayNumber: number;
  weekday: Weekday;
  exercises: CurrentInstanceExercise[];
  addedExercises: CurrentInstancePerformedExercise[];
};

type ExerciseOptionsState = {
  muscleGroups: string[];
  exercisesByMuscleGroup: ExercisesByMuscleGroup;
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
  const router = useRouter();
  const nextLocalExerciseId = useRef(-1);
  const [exerciseRows, setExerciseRows] = useState(() =>
    createCurrentInstanceExerciseRows(exercises, addedExercises)
  );
  const [exerciseDrafts, setExerciseDrafts] = useState<
    Record<string, CurrentInstanceExerciseSubmissionDraft>
  >({});
  const [exerciseOptions, setExerciseOptions] =
    useState<ExerciseOptionsState | null>(null);
  const [isLoadingExerciseOptions, setIsLoadingExerciseOptions] =
    useState(false);
  const [exerciseOptionsError, setExerciseOptionsError] = useState<
    string | null
  >(null);
  const [isSubmittingFinishedDay, setIsSubmittingFinishedDay] = useState(false);

  const handleAddExerciseBelow = (
    afterExerciseKey: string,
    exercise: ExerciseCatalogListItem,
    repeatUntilMesocycleEnd: boolean
  ) => {
    const localExerciseId = nextLocalExerciseId.current--;

    setExerciseRows((currentRows) =>
      insertExerciseRowBelow(currentRows, afterExerciseKey, {
        id: localExerciseId,
        plannedExerciseId: null,
        exerciseOrder: 0,
        repeatUntilMesocycleEnd,
        status: 'ADDED',
        exercise: {
          id: exercise.id,
          name: exercise.name,
          equipment: exercise.equipment,
          muscleGroup: exercise.muscleGroup,
        },
        sets: [],
      })
    );
  };

  const handleExerciseSubmissionDraftChange = useCallback(
    (exerciseKey: string, draft: CurrentInstanceExerciseSubmissionDraft) => {
      setExerciseDrafts((currentDrafts) => {
        if (areSubmissionDraftsEqual(currentDrafts[exerciseKey], draft)) {
          return currentDrafts;
        }

        return {
          ...currentDrafts,
          [exerciseKey]: draft,
        };
      });
    },
    []
  );

  const loadExerciseOptions = async () => {
    if (exerciseOptions || isLoadingExerciseOptions) {
      return;
    }

    setIsLoadingExerciseOptions(true);
    setExerciseOptionsError(null);

    const result = await getReplaceExerciseOptionsAction();

    if (result.status === 'success') {
      setExerciseOptions({
        muscleGroups: result.muscleGroups,
        exercisesByMuscleGroup: result.exercisesByMuscleGroup,
      });
    } else {
      setExerciseOptionsError(
        result.message ?? 'Could not load exercises. Please try again.'
      );
    }

    setIsLoadingExerciseOptions(false);
  };

  const handleSubmitFinishedDay = async () => {
    if (isSubmittingFinishedDay) {
      return;
    }

    const result = buildFinishCurrentInstanceDayPayload({
      currentInstanceDayId,
      exerciseRows,
      exerciseDrafts,
    });

    if (result.status === 'error') {
      console.error('Current instance day is not ready to submit.', {
        errors: result.errors,
      });
      return;
    }

    setIsSubmittingFinishedDay(true);

    try {
      const actionResult = await completeCurrentInstanceDayAction(
        result.payload
      );

      if (actionResult.status === 'success') {
        router.refresh();
      } else {
        console.error('Failed to finish current instance day.', {
          message: actionResult.message,
        });
      }
    } catch (error) {
      console.error('Failed to finish current instance day.', error);
    } finally {
      setIsSubmittingFinishedDay(false);
    }
  };

  return (
    <main className="bg-my-background flex min-h-0 flex-1 flex-col items-center overflow-hidden">
      <div className="flex w-full shrink-0 items-center px-5 py-3.5">
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
      <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden overflow-y-auto px-5">
        {exerciseRows.map(({ exercise, key }) => (
          <InstanceExerciseCard
            key={`${currentInstanceDayId}-${key}`}
            exerciseKey={key}
            exercise={exercise}
            exerciseOptions={exerciseOptions}
            exerciseOptionsError={exerciseOptionsError}
            isLoadingExerciseOptions={isLoadingExerciseOptions}
            loadExerciseOptions={loadExerciseOptions}
            onAddExerciseBelow={(addedExercise, repeatUntilMesocycleEnd) =>
              handleAddExerciseBelow(key, addedExercise, repeatUntilMesocycleEnd)
            }
            onSubmissionDraftChange={handleExerciseSubmissionDraftChange}
          />
        ))}
        <div className="mt-1 mb-5">
          <Button
            className="h-12 w-full text-base font-semibold"
            disabled={isSubmittingFinishedDay}
            size="lg"
            onClick={handleSubmitFinishedDay}
          >
            Finish
          </Button>
        </div>
      </div>
    </main>
  );
}

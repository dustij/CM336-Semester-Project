'use client';

import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type {
  CurrentInstanceExercise,
  CurrentInstancePerformedExercise,
  CurrentInstancePerformedSet,
  CurrentInstancePreviousSet,
} from '@/db/repository/current_repository';
import { cn } from '@/lib/utils';
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  Check,
  Copy,
  EllipsisVertical,
  Plus,
  Trash,
} from 'lucide-react';
import { useRef, useState } from 'react';

type EditableSet = {
  localId: string;
  setOrder: number;
  weight: string;
  reps: string;
  completed: boolean;
};

type InstanceExerciseCardProps = {
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise;
  isMoveDownDisabled: boolean;
  isMoveUpDisabled: boolean;
};

const setGridClass =
  'grid grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_52px] items-center gap-x-4';

export default function InstanceExerciseCard({
  exercise,
  isMoveDownDisabled,
  isMoveUpDisabled,
}: InstanceExerciseCardProps) {
  const exerciseIdentity = getExerciseIdentity(exercise);
  const displayExercise = getDisplayExercise(exercise);
  const [sets, setSets] = useState<EditableSet[]>(() =>
    buildInitialSets(exercise, exerciseIdentity)
  );
  const nextDraftSetId = useRef(sets.length + 1);

  const createDraftSetId = () =>
    `${exerciseIdentity}-draft-${nextDraftSetId.current++}`;

  const handleAddSet = () => {
    setSets((currentSets) => {
      const lastSet = currentSets.at(-1);

      return renumberSets([
        ...currentSets,
        {
          localId: createDraftSetId(),
          setOrder: currentSets.length + 1,
          weight: lastSet?.weight ?? '',
          reps: lastSet?.reps ?? '',
          completed: false,
        },
      ]);
    });
  };

  const handleDuplicateSet = (localId: string) => {
    setSets((currentSets) => {
      const setIndex = currentSets.findIndex((set) => set.localId === localId);

      if (setIndex === -1) {
        return currentSets;
      }

      const setToDuplicate = currentSets[setIndex];

      return renumberSets([
        ...currentSets.slice(0, setIndex + 1),
        {
          ...setToDuplicate,
          localId: createDraftSetId(),
          completed: false,
        },
        ...currentSets.slice(setIndex + 1),
      ]);
    });
  };

  const handleRemoveSet = (localId: string) => {
    setSets((currentSets) => {
      if (currentSets.length === 1) {
        return currentSets;
      }

      return renumberSets(currentSets.filter((set) => set.localId !== localId));
    });
  };

  const handleSetChange = (
    localId: string,
    updates: Partial<Pick<EditableSet, 'weight' | 'reps' | 'completed'>>
  ) => {
    setSets((currentSets) =>
      currentSets.map((set) =>
        set.localId === localId ? { ...set, ...updates } : set
      )
    );
  };

  return (
    // <div className="flex flex-col rounded-[8px] bg-white p-5 shadow ring-1 ring-border/70">
    <div className="flex flex-col gap-2.5 rounded-[8px] bg-white p-2.5 shadow">
      <div className="flex items-center justify-between">
        {/* <div className="flex items-start justify-between gap-3"> */}
        <div className="bg-my-secondary rounded-[8px] px-2.5 py-1.5">
          <p className="text-my-secondary-foreground">
            {/* <p className="text-my-secondary-foreground text-base leading-none font-medium"> */}
            {displayExercise.muscleGroup ?? 'Exercise'}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={buttonVariants({ variant: 'ghost', size: 'icon-xl' })}
            aria-label={`${displayExercise.name} options`}
          >
            <EllipsisVertical className="text-body size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuItem onClick={handleAddSet}>
              <Plus className="size-4" />
              Add set
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>
              <ArrowLeftRight className="size-4" />
              Change
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isMoveUpDisabled} onClick={() => {}}>
              <ArrowUp className="size-4" />
              Move up
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isMoveDownDisabled} onClick={() => {}}>
              <ArrowDown className="size-4" />
              Move down
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => {}}>
              <Trash className="size-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="min-w-0">
        <p className="text-heading truncate leading-tight">
          {displayExercise.name}
        </p>
        {displayExercise.equipment && (
          <p className="text-caption truncate text-sm">
            {displayExercise.equipment}
          </p>
        )}
      </div>

      <div className={cn(setGridClass, 'mt-3')}>
        <div />
        <p className="text-body text-center leading-none font-semibold">
          Weight
        </p>
        <p className="text-body text-center leading-none font-semibold">Reps</p>
        <p className="text-body text-center leading-none font-semibold">Log</p>
      </div>

      <div className="mt-0">
        {sets.map((set, index) => (
          <div
            key={set.localId}
            className={cn(
              setGridClass,
              'py-2.5',
              index > 0 && 'border-border border-t'
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'icon-sm',
                  className: 'text-caption justify-self-start',
                })}
                aria-label={`Set ${set.setOrder} options`}
              >
                <EllipsisVertical className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-36">
                <DropdownMenuItem
                  onClick={() => handleDuplicateSet(set.localId)}
                >
                  <Copy className="size-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={sets.length === 1}
                  onClick={() => handleRemoveSet(set.localId)}
                >
                  <Trash className="size-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              aria-label={`Set ${set.setOrder} weight`}
              inputMode="decimal"
              type="number"
              value={set.weight}
              onChange={(event) =>
                handleSetChange(set.localId, { weight: event.target.value })
              }
              className="text-body h-9 [appearance:textfield] rounded-[12px] bg-white text-center text-xl font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            <Input
              aria-label={`Set ${set.setOrder} reps`}
              inputMode="numeric"
              type="number"
              value={set.reps}
              onChange={(event) =>
                handleSetChange(set.localId, { reps: event.target.value })
              }
              className="text-body h-9 [appearance:textfield] rounded-[12px] bg-white text-center text-xl font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            <label className="flex justify-center">
              <span className="sr-only">Log set {set.setOrder}</span>
              <input
                checked={set.completed}
                className="sr-only"
                type="checkbox"
                onChange={(event) =>
                  handleSetChange(set.localId, {
                    completed: event.target.checked,
                  })
                }
              />
              <span
                className={cn(
                  'border-border flex size-9 items-center justify-center rounded-[12px] border bg-white transition-colors',
                  set.completed && 'border-my-primary bg-my-primary'
                )}
              >
                {set.completed && <Check className="size-5 text-white" />}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildInitialSets(
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise,
  exerciseIdentity: string
): EditableSet[] {
  if (isTemplateExercise(exercise)) {
    if (exercise.performedSets.length > 0) {
      return mapPerformedSets(exercise.performedSets, exerciseIdentity, true);
    }

    if (exercise.previousSets.length > 0) {
      return mapPreviousSets(exercise.previousSets, exerciseIdentity);
    }

    return [createEmptySet(exerciseIdentity, 1)];
  }

  if (exercise.sets.length > 0) {
    return mapPerformedSets(exercise.sets, exerciseIdentity, true);
  }

  return [createEmptySet(exerciseIdentity, 1)];
}

function createEmptySet(exerciseIdentity: string, setOrder: number) {
  return {
    localId: `${exerciseIdentity}-empty-${setOrder}`,
    setOrder,
    weight: '',
    reps: '',
    completed: false,
  };
}

function getDisplayExercise(
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise
) {
  if (isTemplateExercise(exercise)) {
    return exercise.performedExercise?.exercise ?? exercise.templateExercise;
  }

  return exercise.exercise;
}

function getExerciseIdentity(
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise
) {
  if (isTemplateExercise(exercise)) {
    return `planned-${exercise.plannedExerciseId}`;
  }

  return `added-${exercise.id}`;
}

function isTemplateExercise(
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise
): exercise is CurrentInstanceExercise {
  return 'source' in exercise;
}

function mapPerformedSets(
  sets: CurrentInstancePerformedSet[],
  exerciseIdentity: string,
  preserveCompleted: boolean
) {
  return sets.map((set) => ({
    localId: `${exerciseIdentity}-set-${set.id}`,
    setOrder: set.setOrder,
    weight: String(set.weight),
    reps: String(set.reps),
    completed: preserveCompleted ? set.completed : false,
  }));
}

function mapPreviousSets(
  sets: CurrentInstancePreviousSet[],
  exerciseIdentity: string
) {
  return sets.map((set) => ({
    localId: `${exerciseIdentity}-previous-set-${set.id}`,
    setOrder: set.setOrder,
    weight: String(set.weight),
    reps: String(set.reps),
    completed: false,
  }));
}

function renumberSets(sets: EditableSet[]) {
  return sets.map((set, index) => ({
    ...set,
    setOrder: index + 1,
  }));
}

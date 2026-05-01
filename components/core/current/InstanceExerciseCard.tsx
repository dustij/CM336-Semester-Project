'use client';

import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type {
  CurrentInstanceExercise,
  CurrentInstancePerformedExercise,
  CurrentInstancePerformedSet,
  CurrentInstancePreviousSet,
} from '@/db/repository/current_repository';
import type { ExerciseCatalogListItem } from '@/lib/core/types';
import { cn } from '@/lib/utils';
import {
  ArrowLeftRight,
  Check,
  CirclePlus,
  EllipsisVertical,
  SkipForward,
  Trash,
} from 'lucide-react';
import { useRef, useState } from 'react';
import ReplaceExerciseDialog from './ReplaceExerciseDialog';

type EditableSet = {
  localId: string;
  setOrder: number;
  weight: string;
  reps: string;
  completed: boolean;
  status: 'active' | 'skipped';
};

type InstanceExerciseCardProps = {
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise;
  onAddExerciseBelow: (
    afterExerciseOrder: number,
    exercise: ExerciseCatalogListItem
  ) => void;
};

const setGridClass =
  'grid grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_52px] items-center gap-x-4';

export default function InstanceExerciseCard({
  exercise,
  onAddExerciseBelow,
}: InstanceExerciseCardProps) {
  const exerciseIdentity = getExerciseIdentity(exercise);
  const originalDisplayExercise = getDisplayExercise(exercise);
  const [replacementExercise, setReplacementExercise] =
    useState<ExerciseCatalogListItem | null>(null);
  const [, setReplacementRepeatsUntilMesocycleEnd] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [isExerciseHidden, setIsExerciseHidden] = useState(false);
  const [sets, setSets] = useState<EditableSet[]>(() =>
    buildInitialSets(exercise, exerciseIdentity)
  );
  const nextDraftSetId = useRef(sets.length + 1);
  const displayExercise = replacementExercise ?? originalDisplayExercise;
  const activeSets = sets.filter((set) => set.status === 'active');

  const createDraftSetId = () =>
    `${exerciseIdentity}-draft-${nextDraftSetId.current++}`;

  const handleAddSetBelow = (localId: string) => {
    setSets((currentSets) => {
      const setIndex = currentSets.findIndex((set) => set.localId === localId);

      if (setIndex === -1) {
        return currentSets;
      }

      const currentSet = currentSets[setIndex];

      return renumberSets([
        ...currentSets.slice(0, setIndex + 1),
        {
          localId: createDraftSetId(),
          setOrder: currentSet.setOrder + 1,
          weight: currentSet.weight,
          reps: currentSet.reps,
          completed: false,
          status: 'active',
        },
        ...currentSets.slice(setIndex + 1),
      ]);
    });
  };

  const handleSkipSet = (localId: string) => {
    setSets((currentSets) => {
      if (getActiveSetCount(currentSets) <= 1) {
        return currentSets;
      }

      return currentSets.map((set) =>
        set.localId === localId ? { ...set, status: 'skipped' } : set
      );
    });
  };

  const handleRemoveSet = (localId: string) => {
    setSets((currentSets) => {
      if (getActiveSetCount(currentSets) <= 1) {
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

  if (isExerciseHidden) {
    return null;
  }

  return (
    <>
      <ReplaceExerciseDialog
        currentExercise={displayExercise}
        open={isReplaceDialogOpen}
        onOpenChange={setIsReplaceDialogOpen}
        onReplace={(replacement, repeatUntilMesocycleEnd) => {
          setReplacementExercise(replacement);
          setReplacementRepeatsUntilMesocycleEnd(repeatUntilMesocycleEnd);
        }}
      />
      <ReplaceExerciseDialog
        currentExercise={displayExercise}
        open={isAddDialogOpen}
        submitLabel="Add"
        title="Add Exercise"
        onOpenChange={setIsAddDialogOpen}
        onReplace={(addedExercise) =>
          onAddExerciseBelow(getExerciseOrder(exercise), addedExercise)
        }
      />

      <div className="flex flex-col gap-2.5 rounded-[8px] bg-white p-2.5 shadow">
        <div className="flex items-center justify-between">
          <div className="bg-my-secondary rounded-[8px] px-2.5 py-1.5">
            <p className="text-my-secondary-foreground">
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
            <DropdownMenuContent align="end" className="min-w-46 p-1">
              <DropdownMenuLabel className="bg-muted -mx-1 -mt-1 mb-1 rounded-t-lg px-3 py-2">
                Exercise
              </DropdownMenuLabel>
              <DropdownMenuItem
                className=""
                onClick={() => setIsReplaceDialogOpen(true)}
              >
                <ArrowLeftRight className="mr-2 size-4" />
                Change exercise
              </DropdownMenuItem>
              <DropdownMenuItem
                className=""
                onClick={() => setIsAddDialogOpen(true)}
              >
                <CirclePlus className="mr-2 size-4" />
                Add exercise below
              </DropdownMenuItem>
              <DropdownMenuItem
                className=""
                onClick={() => setIsExerciseHidden(true)}
              >
                <SkipForward className="mr-2 size-4" />
                Skip exercise
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className=""
                onClick={() => setIsExerciseHidden(true)}
              >
                <Trash className="mr-2 size-4" />
                Delete exercise
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
          <p className="text-body text-center leading-none font-semibold">
            Reps
          </p>
          <p className="text-body text-center leading-none font-semibold">
            Log
          </p>
        </div>

        <div className="mt-0">
          {activeSets.map((set, index) => (
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
                  <EllipsisVertical className="text-body size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                  <DropdownMenuLabel className="bg-muted -mx-1 -mt-1 mb-1 rounded-t-lg px-3 py-2">
                    Set
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    className=""
                    onClick={() => handleAddSetBelow(set.localId)}
                  >
                    <CirclePlus className="mr-2 size-4" />
                    Add set below
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className=""
                    disabled={activeSets.length === 1}
                    onClick={() => handleSkipSet(set.localId)}
                  >
                    <SkipForward className="mr-2 size-4" />
                    Skip set
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    className=""
                    disabled={activeSets.length === 1}
                    onClick={() => handleRemoveSet(set.localId)}
                  >
                    <Trash className="mr-2 size-4" />
                    Delete set
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
    </>
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

function createEmptySet(
  exerciseIdentity: string,
  setOrder: number
): EditableSet {
  return {
    localId: `${exerciseIdentity}-empty-${setOrder}`,
    setOrder,
    weight: '',
    reps: '',
    completed: false,
    status: 'active',
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

function getExerciseOrder(
  exercise: CurrentInstanceExercise | CurrentInstancePerformedExercise
) {
  return exercise.exerciseOrder;
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
    status: 'active' as const,
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
    status: 'active' as const,
  }));
}

function getActiveSetCount(sets: EditableSet[]) {
  return sets.filter((set) => set.status === 'active').length;
}

function renumberSets(sets: EditableSet[]) {
  return sets.map((set, index) => ({
    ...set,
    setOrder: index + 1,
  }));
}

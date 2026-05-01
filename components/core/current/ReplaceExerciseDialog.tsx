'use client';

import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CurrentInstanceExerciseSnapshot } from '@/db/repository/current_repository';
import type { ExerciseCatalogListItem } from '@/lib/core/types';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

type ReplaceExerciseDialogProps = {
  currentExercise: CurrentInstanceExerciseSnapshot;
  open: boolean;
  submitLabel?: string;
  title?: string;
  onOpenChange: (open: boolean) => void;
  onReplace: (
    exercise: ExerciseCatalogListItem,
    repeatUntilMesocycleEnd: boolean
  ) => void;
};

export default function ReplaceExerciseDialog({
  currentExercise,
  open,
  submitLabel = 'Replace',
  title = 'Replace Exercise',
  onOpenChange,
  onReplace,
}: ReplaceExerciseDialogProps) {
  const comboboxPortalRef = useRef<HTMLDivElement | null>(null);
  const muscleGroups = useMemo(
    () =>
      Array.from(
        new Set(exerciseOptions.map((exercise) => exercise.muscleGroup))
      ).sort(),
    [exerciseOptions]
  );
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(
    currentExercise.muscleGroup ?? ''
  );
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseCatalogListItem | null>(null);
  const [repeatUntilMesocycleEnd, setRepeatUntilMesocycleEnd] = useState(false);

  const filteredExercises = selectedMuscleGroup
    ? exerciseOptions.filter(
        (exercise) => exercise.muscleGroup === selectedMuscleGroup
      )
    : [];

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSelectedMuscleGroup(currentExercise.muscleGroup ?? '');
      setSelectedExercise(null);
      setRepeatUntilMesocycleEnd(false);
    }

    onOpenChange(nextOpen);
  };

  const handleReplace = () => {
    if (!selectedExercise) {
      return;
    }

    onReplace(selectedExercise, repeatUntilMesocycleEnd);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] gap-6 rounded-[8px] bg-white p-5"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Choose a replacement exercise.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span>
              Muscle Group <span className="text-my-primary">*</span>
            </span>
            <Combobox
              items={muscleGroups}
              value={selectedMuscleGroup}
              onValueChange={(value) => {
                setSelectedMuscleGroup(value ?? '');
                setSelectedExercise(null);
              }}
              itemToStringLabel={(item) => item}
              itemToStringValue={(item) => item}
            >
              <ComboboxInput
                placeholder="Choose..."
                className="h-10 bg-white"
              />
              <ComboboxContent container={comboboxPortalRef}>
                <ComboboxEmpty>No muscle groups found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </label>

          <label className="grid gap-2">
            <span>
              Exercise <span className="text-my-primary">*</span>
            </span>
            <Combobox
              items={filteredExercises}
              value={selectedExercise}
              onValueChange={(value) => setSelectedExercise(value ?? null)}
              itemToStringLabel={(exercise) => exercise.name}
              itemToStringValue={(exercise) => `${exercise.id}`}
              isItemEqualToValue={(item, selected) => item.id === selected.id}
            >
              <ComboboxInput
                disabled={!selectedMuscleGroup}
                placeholder="Choose..."
                className="h-10 bg-white"
              />
              <ComboboxContent container={comboboxPortalRef}>
                <ComboboxEmpty>No exercises found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item.id} value={item}>
                      {item.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </label>
        </div>

        <label className="flex items-center gap-3">
          <input
            checked={repeatUntilMesocycleEnd}
            className="sr-only"
            type="checkbox"
            onChange={(event) =>
              setRepeatUntilMesocycleEnd(event.target.checked)
            }
          />
          <span
            className={cn(
              'border-border flex size-9 items-center justify-center rounded-[8px] border bg-white transition-colors',
              repeatUntilMesocycleEnd && 'border-my-primary bg-my-primary'
            )}
          />
          <span>Repeat until the end of this mesocycle</span>
        </label>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            className="px-0"
            onClick={() => onOpenChange(false)}
          >
            <ArrowLeft className="size-5" />
            Back
          </Button>
          <Button
            type="button"
            disabled={!selectedExercise}
            className="h-10 px-5"
            onClick={handleReplace}
          >
            {submitLabel}
          </Button>
        </div>

        <div ref={comboboxPortalRef} />
      </DialogContent>
    </Dialog>
  );
}

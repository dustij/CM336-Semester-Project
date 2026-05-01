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
import type {
  ExerciseCatalogListItem,
  ExercisesByMuscleGroup,
} from '@/lib/core/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check } from 'lucide-react';
import { useRef, useState } from 'react';

type ReplaceExerciseDialogProps = {
  exercisesByMuscleGroup: ExercisesByMuscleGroup;
  loadingOptions: boolean;
  loadOptionsError: string | null;
  muscleGroups: string[];
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
  exercisesByMuscleGroup,
  loadingOptions,
  loadOptionsError,
  muscleGroups,
  open,
  submitLabel = 'Replace',
  title = 'Replace Exercise',
  onOpenChange,
  onReplace,
}: ReplaceExerciseDialogProps) {
  const comboboxPortalRef = useRef<HTMLDivElement | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseCatalogListItem | null>(null);
  const [repeatUntilMesocycleEnd, setRepeatUntilMesocycleEnd] = useState(false);

  const filteredExercises = selectedMuscleGroup
    ? (exercisesByMuscleGroup[selectedMuscleGroup] ?? []).map((exercise) => ({
        ...exercise,
        muscleGroup: selectedMuscleGroup,
      }))
    : [];

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSelectedMuscleGroup('');
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
        className="w-[calc(100%-2rem)] gap-6 rounded-[8px] bg-white p-5 pb-0"
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
                disabled={loadingOptions}
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
                disabled={!selectedMuscleGroup || loadingOptions}
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

        {loadingOptions && <p className="text-caption">Loading exercises...</p>}
        {loadOptionsError && (
          <p className="text-my-primary">{loadOptionsError}</p>
        )}

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
          >
            {repeatUntilMesocycleEnd && <Check className="size-5 text-white" />}
          </span>
          <span>Repeat until the end of this mesocycle</span>
        </label>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            className="text-body min-w-20"
            onClick={() => {
              onOpenChange(false);
              setSelectedMuscleGroup('');
              setSelectedExercise(null);
              setRepeatUntilMesocycleEnd(false);
            }}
          >
            <ArrowLeft className="size-[18px]" />
            Back
          </Button>
          <Button
            type="button"
            disabled={!selectedExercise || loadingOptions}
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

'use client';

import { Button } from '@/components/ui/button';
import { MuscleGroup } from '@/db/repository/muscle_group_repository';
import type {
  ExercisesByMuscleGroup,
  MesocycleDayDraft,
  PlannedExerciseDraft,
  Weekday,
} from '@/lib/core/types';
import { ArrowLeft, Plus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FinalizeMesocycleDialog from './FinalizeMesocycleDialog';
import MesocycleTemplateDay from './MesocycleTemplateDay';
import {
  addDayToMesocycleTemplate,
  addMuscleGroupToDay,
  changePlannedExerciseMuscleGroupInDay,
  duplicateDayInMesocycleTemplate,
  moveDayInMesocycleTemplate,
  movePlannedExerciseInDay,
  removeDayFromMesocycleTemplate,
  removePlannedExerciseFromDay,
  updateMesocycleDayOfWeek,
  updatePlannedExerciseInDay,
} from './state';

type NewMesocyclePageProps = {
  muscleGroups: MuscleGroup[];
  exercisesByMuscleGroup: ExercisesByMuscleGroup;
};

export default function NewMesocyclePage({
  exercisesByMuscleGroup,
  muscleGroups,
}: NewMesocyclePageProps) {
  const router = useRouter();
  const [mesocycleDays, setMesocycleDays] = useState<MesocycleDayDraft[]>([
    { dayOfWeek: null, dayOrder: 0, plannedExercises: [] },
  ]);

  const pathname = usePathname();

  useEffect(() => {
    // Reset the exercises when leaving page
    setMesocycleDays([{ dayOfWeek: null, dayOrder: 0, plannedExercises: [] }]);
  }, [pathname]);

  const isMaxDays = mesocycleDays.length >= 7;
  const daySet = new Set<Weekday>();
  let isValid = true;

  for (const day of mesocycleDays) {
    // Day cannot be null
    if (day.dayOfWeek == null) {
      isValid = false;
      break;
    }

    daySet.add(day.dayOfWeek);

    // Must have at least one muscle group card
    if (day.plannedExercises.length <= 0) {
      isValid = false;
      break;
    }

    // Must have an exercise for each muscle group card
    for (const plannedExercise of day.plannedExercises) {
      if (plannedExercise.id == null) {
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      break;
    }
  }

  // Day of week must be unique
  if (daySet.size !== mesocycleDays.length) {
    isValid = false;
  }

  const handleDayChange = (dayIndex: number, dayOfWeek: Weekday | null) => {
    setMesocycleDays((prev) =>
      updateMesocycleDayOfWeek(prev, dayIndex, dayOfWeek)
    );
  };

  const handleAddMuscleGroupToDay = (dayIndex: number, muscleGroup: string) => {
    setMesocycleDays((prev) =>
      addMuscleGroupToDay(prev, dayIndex, muscleGroup)
    );
  };

  const handleRemovePlannedExerciseFromDay = (
    dayIndex: number,
    plannedExerciseIndex: number
  ) => {
    setMesocycleDays((prev) =>
      removePlannedExerciseFromDay(prev, dayIndex, plannedExerciseIndex)
    );
  };

  const handlePlannedExerciseChanged = (
    dayIndex: number,
    plannedExerciseIndex: number,
    plannedExercise: PlannedExerciseDraft
  ) => {
    setMesocycleDays((prev) =>
      updatePlannedExerciseInDay(
        prev,
        dayIndex,
        plannedExerciseIndex,
        plannedExercise
      )
    );
  };

  const handleChangePlannedExerciseMuscleGroup = (
    dayIndex: number,
    plannedExerciseIndex: number,
    muscleGroup: string
  ) => {
    setMesocycleDays((prev) =>
      changePlannedExerciseMuscleGroupInDay(
        prev,
        dayIndex,
        plannedExerciseIndex,
        muscleGroup
      )
    );
  };

  const handleMovePlannedExerciseInDay = (
    dayIndex: number,
    fromPlannedExerciseIndex: number,
    toPlannedExerciseIndex: number
  ) => {
    setMesocycleDays((prev) =>
      movePlannedExerciseInDay(
        prev,
        dayIndex,
        fromPlannedExerciseIndex,
        toPlannedExerciseIndex
      )
    );
  };

  const handleMoveDayInMesocycleTemplate = (
    fromDayIndex: number,
    toDayIndex: number
  ) => {
    setMesocycleDays((prev) =>
      moveDayInMesocycleTemplate(prev, fromDayIndex, toDayIndex)
    );
  };

  const handleAddDayToMesocycleTemplate = () => {
    setMesocycleDays((prev) => addDayToMesocycleTemplate(prev));
  };

  const handleRemoveDayFromMesocycleTemplate = (dayIndex: number) => {
    setMesocycleDays((prev) => removeDayFromMesocycleTemplate(prev, dayIndex));
  };

  const handleDuplicateDayInMesocycleTemplate = (dayIndex: number) => {
    setMesocycleDays((prev) => duplicateDayInMesocycleTemplate(prev, dayIndex));
  };

  return (
    <main className="bg-my-background flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex w-full items-center justify-between px-5 py-3.5">
        <Button
          variant="ghost"
          size="lg"
          className="text-body min-w-20"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-[18px]" />
          Back
        </Button>
        <FinalizeMesocycleDialog
          disabled={!isValid}
          mesocycleDays={mesocycleDays}
        />
      </div>
      <div className="flex min-h-0 min-w-full flex-1 gap-4 overflow-auto px-5">
        {mesocycleDays.map((mDay, i) => (
          <MesocycleTemplateDay
            key={mDay.dayOrder}
            day={mDay}
            dayIndex={i}
            dayCount={mesocycleDays.length}
            exercisesByMuscleGroup={exercisesByMuscleGroup}
            isDuplicateDisabled={isMaxDays}
            muscleGroups={muscleGroups}
            onAddMuscleGroup={handleAddMuscleGroupToDay}
            onDayChange={handleDayChange}
            onDuplicateDay={handleDuplicateDayInMesocycleTemplate}
            onMoveDay={handleMoveDayInMesocycleTemplate}
            onMovePlannedExercise={handleMovePlannedExerciseInDay}
            onPlannedExerciseChange={handlePlannedExerciseChanged}
            onRemoveDay={handleRemoveDayFromMesocycleTemplate}
            onRemovePlannedExercise={handleRemovePlannedExerciseFromDay}
            onChangePlannedExerciseMuscleGroup={
              handleChangePlannedExerciseMuscleGroup
            }
          />
        ))}
        <div className="border-border flex max-h-[60px] min-w-[300px] items-center justify-center rounded-[8px] border-2 border-dashed">
          <Button
            variant="ghost"
            size="lg"
            className="text-body text-md size-full"
            disabled={isMaxDays}
            onClick={handleAddDayToMesocycleTemplate}
          >
            <Plus className="size-[20px]" />
            Add a day
          </Button>
        </div>
      </div>
    </main>
  );
}

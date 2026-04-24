'use client';

import DayComboBox from '@/components/core/shared/DayComboBox';
import { Button } from '@/components/ui/button';
import type {
  ExercisesByMuscleGroup,
  MesocycleDayDraft,
  PlannedExerciseDraft,
  Weekday,
} from '@/lib/core/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MuscleGroupDialog from './MuscleGroupDialog';
import PlannedExerciseCard from './PlannedExerciseCard';
import {
  addMuscleGroupToDay,
  removePlannedExerciseFromDay,
  updateMesocycleDayOfWeek,
  updatePlannedExerciseInDay,
} from './state';

type NewMesocyclePageProps = {
  muscleGroups: string[];
  exercisesByMuscleGroup: ExercisesByMuscleGroup;
};

export default function NewMesocyclePage({
  exercisesByMuscleGroup,
  muscleGroups,
}: NewMesocyclePageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mesocycleDays, setMesocycleDays] = useState<MesocycleDayDraft[]>([
    { dayOfWeek: null, dayOrder: 0, plannedExercises: [] },
  ]);

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
        <Button size="lg" className="min-w-20" disabled={!isValid}>
          Create
        </Button>
      </div>
      <div className="flex min-h-0 min-w-full flex-1 gap-4 overflow-auto px-5">
        {mesocycleDays.map((mDay, i) => (
          // dayOfWeek must be unique
          <div key={mDay.dayOrder} className="min-w-[300px]">
            <div className="flex items-center justify-between bg-white p-2.5">
              <div className="h-[40px] max-w-38">
                <DayComboBox
                  value={mDay.dayOfWeek}
                  onValueChange={(dayOfWeek) => handleDayChange(i, dayOfWeek)}
                />
              </div>
              <div>
                <Button variant="ghost" size="icon-xl" className="text-red-500">
                  {i !== 0 && <Trash className="size-5" />}
                </Button>
              </div>
            </div>
            {/* List planned exercises */}
            <div
              className={cn(
                'flex flex-col gap-2.5 bg-gray-100 px-2.5',
                mDay.plannedExercises.length > 0 && 'pt-2.5'
              )}
            >
              {mDay.plannedExercises.map((planned, plannedIndex) => (
                <PlannedExerciseCard
                  exercises={exercisesByMuscleGroup[planned.muscleGroup] ?? []}
                  value={planned}
                  key={`${planned.muscleGroup}-${planned.exerciseOrder}`}
                  onValueChanged={(nextPlannedExercise) =>
                    handlePlannedExerciseChanged(
                      i,
                      plannedIndex,
                      nextPlannedExercise
                    )
                  }
                  onRemove={() =>
                    handleRemovePlannedExerciseFromDay(i, plannedIndex)
                  }
                />
              ))}
            </div>
            {/* Add muscle group */}
            <div className="bg-gray-100 p-2.5">
              <div className="border-border flex h-[60px] items-center justify-center rounded-[8px] border-2 border-dashed">
                <MuscleGroupDialog
                  muscleGroups={muscleGroups}
                  onSelect={(muscleGroup) =>
                    handleAddMuscleGroupToDay(i, muscleGroup)
                  }
                />
              </div>
            </div>
          </div>
        ))}
        <div className="border-border flex max-h-[60px] min-w-[300px] items-center justify-center rounded-[8px] border-2 border-dashed">
          <Button
            variant="ghost"
            size="lg"
            className="text-body text-md size-full"
            disabled={isMaxDays}
          >
            <Plus className="size-[20px]" />
            Add a day
          </Button>
        </div>
      </div>
    </main>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';
import DayComboBox from './DayComboBox';
import MuscleGroupDialog from './MuscleGroupDialog';
import PlannedExerciseCard from './PlannedExerciseCard';

type MesocycleDay = {
  dayOfWeek:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';
  dayOrder: number;
  plannedExercises: PlannedExercise[];
};

type PlannedExercise = {
  exerciseId: number;
  exerciseName: string;
  exerciseOrder: number;
  exerciseType: string;
  equipment: string;
  muscleGroup: string;
};

type NewMesocyclePageProps = {
  muscleGroups: string[];
};

export default function NewMesocyclePage({
  muscleGroups,
}: NewMesocyclePageProps) {
  // TODO: implement logic to enforce unique dayOfWeek and limit days to max 7
  const router = useRouter();
  const [mesocycleDays, setMesocycleDays] = useState<MesocycleDay[]>([
    { dayOfWeek: 'Monday', dayOrder: 0, plannedExercises: [] },
  ]);

  const addMuscleGroupToDay = (dayIndex: number, muscleGroup: string) => {
    setMesocycleDays((prev) =>
      prev.map((day, index) => {
        if (index !== dayIndex) {
          return day;
        }

        return {
          ...day,
          plannedExercises: [
            ...day.plannedExercises,
            {
              exerciseId: 0,
              exerciseName: muscleGroup,
              exerciseOrder: day.plannedExercises.length,
              exerciseType: '',
              equipment: '',
              muscleGroup,
            },
          ],
        };
      })
    );
  };

  const removePlannedExerciseFromDay = (
    dayIndex: number,
    plannedExerciseIndex: number
  ) => {
    setMesocycleDays((prev) =>
      prev.map((day, index) => {
        if (index !== dayIndex) {
          return day;
        }

        return {
          ...day,
          plannedExercises: day.plannedExercises
            .filter(
              (_, exerciseIndex) => exerciseIndex !== plannedExerciseIndex
            )
            .map((exercise, exerciseOrder) => ({
              ...exercise,
              exerciseOrder,
            })),
        };
      })
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
        <Button size="lg" className="min-w-20" disabled>
          Create
        </Button>
      </div>
      <div className="flex min-h-0 min-w-full flex-1 gap-4 overflow-auto px-5">
        {mesocycleDays.map((mDay, i) => (
          // dayOfWeek must be unique
          <div key={mDay.dayOfWeek} className="min-w-[300px]">
            <div className="flex items-center justify-between bg-white p-2.5">
              <div className="h-[40px] max-w-38">
                <DayComboBox />
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
                  muscleGroup={planned.muscleGroup}
                  key={`${planned.muscleGroup}-${planned.exerciseOrder}`}
                  onRemove={() => removePlannedExerciseFromDay(i, plannedIndex)}
                />
              ))}
            </div>
            {/* Add muscle group */}
            <div className="bg-gray-100 p-2.5">
              <div className="border-border flex h-[60px] items-center justify-center rounded-[8px] border-2 border-dashed">
                <MuscleGroupDialog
                  muscleGroups={muscleGroups}
                  onSelect={(muscleGroup) =>
                    addMuscleGroupToDay(i, muscleGroup)
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
          >
            <Plus className="size-[20px]" />
            Add a day
          </Button>
        </div>
      </div>
    </main>
  );
}

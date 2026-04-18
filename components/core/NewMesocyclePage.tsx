'use client';

import { ArrowLeft, Plus, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../ui/combobox';
import MuscleGroupDialog from './MuscleGroupDialog';

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
  const [mesocycleDays] = useState<MesocycleDay[]>([
    { dayOfWeek: 'Monday', dayOrder: 0, plannedExercises: [] },
  ]);

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
                <Combobox
                  items={[
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                  ]}
                >
                  <ComboboxInput
                    placeholder="Choose..."
                    className="text-body h-full"
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No day found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem
                          key={item}
                          value={item}
                          className="text-md text-body"
                        >
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div>
                <Button variant="ghost" size="icon-xl" className="text-red-500">
                  {i !== 0 && <Trash className="size-5" />}
                </Button>
              </div>
            </div>
            <div className="bg-gray-100 p-2.5">
              <div className="border-border flex h-[60px] items-center justify-center rounded-[8px] border-2 border-dashed">
                <MuscleGroupDialog muscleGroups={muscleGroups} />
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

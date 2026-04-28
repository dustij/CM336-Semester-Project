'use client';

import DayComboBox from '@/components/core/shared/DayComboBox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MuscleGroup } from '@/db/repository/muscle_group_repository';
import type {
  ExercisesByMuscleGroup,
  MesocycleDayDraft,
  PlannedExerciseDraft,
  Weekday,
} from '@/lib/core/types';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  EllipsisVertical,
  Trash,
} from 'lucide-react';
import { useState } from 'react';
import MuscleGroupDialog from './MuscleGroupDialog';
import PlannedExerciseCard from './PlannedExerciseCard';

type MesocycleTemplateDayProps = {
  day: MesocycleDayDraft;
  dayIndex: number;
  dayCount: number;
  exercisesByMuscleGroup: ExercisesByMuscleGroup;
  isDuplicateDisabled: boolean;
  muscleGroups: MuscleGroup[];
  onAddMuscleGroup: (dayIndex: number, muscleGroup: string) => void;
  onDayChange: (dayIndex: number, dayOfWeek: Weekday | null) => void;
  onDuplicateDay: (dayIndex: number) => void;
  onMoveDay: (fromDayIndex: number, toDayIndex: number) => void;
  onMovePlannedExercise: (
    dayIndex: number,
    fromPlannedExerciseIndex: number,
    toPlannedExerciseIndex: number
  ) => void;
  onPlannedExerciseChange: (
    dayIndex: number,
    plannedExerciseIndex: number,
    plannedExercise: PlannedExerciseDraft
  ) => void;
  onRemoveDay: (dayIndex: number) => void;
  onRemovePlannedExercise: (
    dayIndex: number,
    plannedExerciseIndex: number
  ) => void;
  onChangePlannedExerciseMuscleGroup: (
    dayIndex: number,
    plannedExerciseIndex: number,
    muscleGroup: string
  ) => void;
};

export default function MesocycleTemplateDay({
  day,
  dayIndex,
  dayCount,
  exercisesByMuscleGroup,
  isDuplicateDisabled,
  muscleGroups,
  onAddMuscleGroup,
  onDayChange,
  onDuplicateDay,
  onMoveDay,
  onMovePlannedExercise,
  onPlannedExerciseChange,
  onRemoveDay,
  onRemovePlannedExercise,
  onChangePlannedExerciseMuscleGroup,
}: MesocycleTemplateDayProps) {
  const [changePlannedExerciseIndex, setChangePlannedExerciseIndex] = useState<
    number | null
  >(null);
  const isChangeDialogOpen = changePlannedExerciseIndex != null;

  const handleChangeExercise = (muscleGroup: string) => {
    if (changePlannedExerciseIndex == null) {
      return;
    }

    if (day.plannedExercises[changePlannedExerciseIndex] == null) {
      setChangePlannedExerciseIndex(null);
      return;
    }

    onChangePlannedExerciseMuscleGroup(
      dayIndex,
      changePlannedExerciseIndex,
      muscleGroup
    );
  };

  return (
    <div className="min-w-[300px]">
      <div className="flex items-center justify-between bg-white p-2.5">
        <div className="h-[40px] max-w-38">
          <DayComboBox
            value={day.dayOfWeek}
            onValueChange={(dayOfWeek) => onDayChange(dayIndex, dayOfWeek)}
          />
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xl" aria-label="Day options">
                <EllipsisVertical className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <DropdownMenuItem
                disabled={dayIndex === 0}
                onClick={() => onMoveDay(dayIndex, dayIndex - 1)}
              >
                <ArrowLeft className="size-4" />
                Move left
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={dayIndex === dayCount - 1}
                onClick={() => onMoveDay(dayIndex, dayIndex + 1)}
              >
                <ArrowRight className="size-4" />
                Move right
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isDuplicateDisabled}
                onClick={() => onDuplicateDay(dayIndex)}
              >
                <Copy className="size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={dayCount === 1}
                onClick={() => onRemoveDay(dayIndex)}
              >
                <Trash className="size-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* List planned exercises */}
      <div
        className={cn(
          'flex flex-col gap-2.5 bg-gray-100 px-2.5',
          day.plannedExercises.length > 0 && 'pt-2.5'
        )}
      >
        {day.plannedExercises.map((planned, plannedIndex) => (
          <PlannedExerciseCard
            exercises={exercisesByMuscleGroup[planned.muscleGroup] ?? []}
            isMoveDownDisabled={
              plannedIndex === day.plannedExercises.length - 1
            }
            isMoveUpDisabled={plannedIndex === 0}
            value={planned}
            key={`${planned.muscleGroup}-${planned.exerciseOrder}`}
            onChangeExercise={() => setChangePlannedExerciseIndex(plannedIndex)}
            onMoveDown={() =>
              onMovePlannedExercise(dayIndex, plannedIndex, plannedIndex + 1)
            }
            onMoveUp={() =>
              onMovePlannedExercise(dayIndex, plannedIndex, plannedIndex - 1)
            }
            onValueChanged={(nextPlannedExercise) =>
              onPlannedExerciseChange(
                dayIndex,
                plannedIndex,
                nextPlannedExercise
              )
            }
            onRemove={() => onRemovePlannedExercise(dayIndex, plannedIndex)}
          />
        ))}
      </div>
      <MuscleGroupDialog
        description="Select a new muscle group for this planned exercise."
        muscleGroups={muscleGroups}
        open={isChangeDialogOpen}
        showTrigger={false}
        title="Change muscle group"
        onOpenChange={(open) => {
          if (!open) {
            setChangePlannedExerciseIndex(null);
          }
        }}
        onSelect={handleChangeExercise}
      />
      {/* Add muscle group */}
      <div className="bg-gray-100 p-2.5">
        <div className="border-border flex h-[60px] items-center justify-center rounded-[8px] border-2 border-dashed">
          <MuscleGroupDialog
            muscleGroups={muscleGroups}
            onSelect={(muscleGroup) => onAddMuscleGroup(dayIndex, muscleGroup)}
          />
        </div>
      </div>
    </div>
  );
}

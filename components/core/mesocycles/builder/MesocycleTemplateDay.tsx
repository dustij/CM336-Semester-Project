import DayComboBox from '@/components/core/shared/DayComboBox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type {
  ExercisesByMuscleGroup,
  MesocycleDayDraft,
  PlannedExerciseDraft,
  Weekday,
} from '@/lib/core/types';
import { cn } from '@/lib/utils';
import { Copy, EllipsisVertical, Trash } from 'lucide-react';
import MuscleGroupDialog from './MuscleGroupDialog';
import PlannedExerciseCard from './PlannedExerciseCard';

type MesocycleTemplateDayProps = {
  day: MesocycleDayDraft;
  dayIndex: number;
  exercisesByMuscleGroup: ExercisesByMuscleGroup;
  isDuplicateDisabled: boolean;
  muscleGroups: string[];
  onAddMuscleGroup: (dayIndex: number, muscleGroup: string) => void;
  onDayChange: (dayIndex: number, dayOfWeek: Weekday | null) => void;
  onDuplicateDay: (dayIndex: number) => void;
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
};

export default function MesocycleTemplateDay({
  day,
  dayIndex,
  exercisesByMuscleGroup,
  isDuplicateDisabled,
  muscleGroups,
  onAddMuscleGroup,
  onDayChange,
  onDuplicateDay,
  onPlannedExerciseChange,
  onRemoveDay,
  onRemovePlannedExercise,
}: MesocycleTemplateDayProps) {
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
                disabled={isDuplicateDisabled}
                onClick={() => onDuplicateDay(dayIndex)}
              >
                <Copy className="size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={dayIndex === 0}
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
            value={planned}
            key={`${planned.muscleGroup}-${planned.exerciseOrder}`}
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

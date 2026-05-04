import ExerciseComboBox from '@/components/core/shared/ExerciseComboBox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ExerciseListItem, PlannedExerciseDraft } from '@/lib/core/types';
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  EllipsisVertical,
  Trash,
} from 'lucide-react';

type PlannedExerciseCardProps = {
  exercises: ExerciseListItem[];
  isMoveDownDisabled: boolean;
  isMoveUpDisabled: boolean;
  readOnly?: boolean;
  value: PlannedExerciseDraft;
  onChangeExercise: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onValueChanged: (value: PlannedExerciseDraft) => void;
  onRemove: () => void;
};
export default function PlannedExerciseCard({
  exercises,
  isMoveDownDisabled,
  isMoveUpDisabled,
  readOnly = false,
  value,
  onChangeExercise,
  onMoveDown,
  onMoveUp,
  onValueChanged,
  onRemove,
}: PlannedExerciseCardProps) {
  const selectedExercise =
    value.id == null
      ? null
      : (exercises.find((exercise) => exercise.id === value.id) ?? null);

  return (
    <div className="flex flex-col gap-2.5 rounded-[8px] bg-white p-2.5 shadow">
      <div className="flex items-center justify-between">
        <div className="bg-my-secondary rounded-[8px] px-2 py-1">
          <p className="text-my-secondary-foreground">{value.muscleGroup}</p>
        </div>
        {!readOnly && (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xl"
                  aria-label="Planned exercise options"
                >
                  <EllipsisVertical className="text-body size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-36">
                <DropdownMenuItem onClick={onChangeExercise}>
                  <ArrowLeftRight className="size-4" />
                  Change
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isMoveUpDisabled}
                  onClick={onMoveUp}
                >
                  <ArrowUp className="size-4" />
                  Move up
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isMoveDownDisabled}
                  onClick={onMoveDown}
                >
                  <ArrowDown className="size-4" />
                  Move down
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={onRemove}>
                  <Trash className="size-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      {readOnly ? (
        <div className="min-w-0">
          <p className="text-heading truncate leading-tight">
            {value.name ?? selectedExercise?.name ?? 'No exercise selected'}
          </p>
          {(value.equipment ?? selectedExercise?.equipment) && (
            <p className="text-caption truncate text-sm">
              {value.equipment ?? selectedExercise?.equipment}
            </p>
          )}
        </div>
      ) : (
        <div>
          <ExerciseComboBox
            exercises={exercises}
            value={selectedExercise}
            onValueChange={(exercise) =>
              onValueChanged({
                ...value,
                id: exercise?.id ?? null,
                name: exercise?.name ?? null,
                equipment: exercise?.equipment ?? null,
              })
            }
          />
        </div>
      )}
    </div>
  );
}

import ExerciseComboBox from '@/components/core/shared/ExerciseComboBox';
import { Button } from '@/components/ui/button';
import type { ExerciseListItem, PlannedExerciseDraft } from '@/lib/core/types';
import { Trash } from 'lucide-react';

type PlannedExerciseCardProps = {
  exercises: ExerciseListItem[];
  value: PlannedExerciseDraft;
  onValueChanged: (value: PlannedExerciseDraft) => void;
  onRemove: () => void;
};
export default function PlannedExerciseCard({
  exercises,
  value,
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
        <div>
          <Button
            variant="ghost"
            size="icon-xl"
            className="text-red-500 hover:bg-transparent hover:text-red-500/80"
            onClick={onRemove}
          >
            <Trash className="size-5" />
          </Button>
        </div>
      </div>
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
    </div>
  );
}

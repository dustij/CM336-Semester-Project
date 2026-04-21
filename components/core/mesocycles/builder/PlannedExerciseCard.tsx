import ExerciseComboBox from '@/components/core/shared/ExerciseComboBox';
import { Button } from '@/components/ui/button';
import type { ExerciseListItem } from '@/lib/core/types';
import { Trash } from 'lucide-react';

type PlannedExerciseCardProps = {
  exercises: ExerciseListItem[];
  muscleGroup: string;
  onRemove: () => void;
};
export default function PlannedExerciseCard({
  exercises,
  muscleGroup,
  onRemove,
}: PlannedExerciseCardProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[8px] bg-white p-2.5 shadow">
      <div className="flex items-center justify-between">
        <div className="bg-my-secondary rounded-[8px] px-2 py-1">
          <p className="text-my-secondary-foreground">{muscleGroup}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-xl"
          className="text-red-500"
          onClick={onRemove}
        >
          <Trash className="size-5" />
        </Button>
      </div>
      <div>
        <ExerciseComboBox exercises={exercises} />
      </div>
    </div>
  );
}

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import type { ExerciseListItem } from '@/lib/core/types';

type ExerciseComboBoxProps = {
  exercises: ExerciseListItem[];
};

export default function ExerciseComboBox({ exercises }: ExerciseComboBoxProps) {
  const exerciseNames = exercises.map((exercise) => exercise.name);

  return (
    <Combobox items={exerciseNames}>
      <ComboboxInput
        placeholder="Choose exercise..."
        className="text-body h-full"
      />
      <ComboboxContent>
        <ComboboxEmpty>No exercise found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item} className="text-md text-body">
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

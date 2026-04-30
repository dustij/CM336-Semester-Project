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
  value: ExerciseListItem | null;
  disabled?: boolean;
  onValueChange: (value: ExerciseListItem | null) => void;
};

export default function ExerciseComboBox({
  disabled = false,
  exercises,
  value,
  onValueChange,
}: ExerciseComboBoxProps) {
  return (
    <Combobox
      items={exercises}
      value={value}
      onValueChange={onValueChange}
      itemToStringLabel={(exercise) => exercise.name}
      itemToStringValue={(exercise) => `${exercise.id}`}
      isItemEqualToValue={(item, selected) => item.id === selected.id}
    >
      <ComboboxInput
        placeholder="Choose exercise..."
        className="text-body h-full"
        disabled={disabled}
      />
      <ComboboxContent>
        <ComboboxEmpty>No exercise found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem
              key={item.id}
              value={item}
              className="text-md text-body"
            >
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

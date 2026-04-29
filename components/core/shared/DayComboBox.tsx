import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Weekday } from '@/lib/core/types';

type DayComboBoxProps = {
  value: Weekday | null;
  disabled?: boolean;
  onValueChange: (value: Weekday | null) => void;
};

const WEEKDAYS: Weekday[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function DayComboBox({
  disabled = false,
  value,
  onValueChange,
}: DayComboBoxProps) {
  return (
    <Combobox items={WEEKDAYS} value={value} onValueChange={onValueChange}>
      <ComboboxInput
        placeholder="Choose day..."
        className="text-body h-full"
        disabled={disabled}
      />
      <ComboboxContent>
        <ComboboxEmpty>No day found.</ComboboxEmpty>
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

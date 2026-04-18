import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../ui/combobox';

export default function DayComboBox() {
  return (
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
      <ComboboxInput placeholder="Choose day..." className="text-body h-full" />
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

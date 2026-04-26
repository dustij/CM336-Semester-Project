'use client';

import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type {
  ExerciseCatalogFilters,
  ExerciseFilterOptions,
} from '@/lib/core/types';
import { ListFilter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent, type RefObject } from 'react';

type ExerciseFilterDialogProps = {
  filters: ExerciseCatalogFilters;
  filterOptions: ExerciseFilterOptions;
  onNavigateStart: () => void;
};

type FilterComboboxProps = {
  name: 'equipment' | 'muscleGroup';
  value: string;
  onValueChange: (value: string) => void;
  items: string[];
  allLabel: string;
  emptyLabel: string;
  placeholder: string;
  portalContainer: RefObject<HTMLDivElement | null>;
};

function FilterCombobox({
  name,
  value,
  onValueChange,
  items,
  allLabel,
  emptyLabel,
  placeholder,
  portalContainer,
}: FilterComboboxProps) {
  const options = ['', ...items];

  return (
    <Combobox
      name={name}
      items={options}
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue ?? '')}
      itemToStringLabel={(item) => item || allLabel}
      itemToStringValue={(item) => item}
    >
      <ComboboxInput
        placeholder={placeholder}
        className="h-10 rounded-xl bg-white text-[14px] font-medium text-[#667085]"
      />
      <ComboboxContent container={portalContainer}>
        <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem
              key={item || 'all'}
              value={item}
              className="text-[14px] font-medium"
            >
              {item || allLabel}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export function ExerciseFilterDialog({
  filters,
  filterOptions,
  onNavigateStart,
}: ExerciseFilterDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [muscleGroupValue, setMuscleGroupValue] = useState(
    filters.muscleGroup ?? ''
  );
  const [equipmentValue, setEquipmentValue] = useState(filters.equipment ?? '');
  const comboboxPortalRef = useRef<HTMLDivElement | null>(null);
  const activeFilterCount = [
    filters.q,
    filters.equipment,
    filters.muscleGroup,
  ].filter(Boolean).length;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setMuscleGroupValue(filters.muscleGroup ?? '');
      setEquipmentValue(filters.equipment ?? '');
    }

    setOpen(nextOpen);
  };

  const navigateTo = (href: string) => {
    setOpen(false);

    if (href === `${window.location.pathname}${window.location.search}`) {
      return;
    }

    onNavigateStart();
    router.push(href);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const key of ['q', 'muscleGroup', 'equipment']) {
      const value = formData.get(key);
      const trimmedValue = typeof value === 'string' ? value.trim() : '';

      if (trimmedValue) {
        params.set(key, trimmedValue);
      }
    }

    const query = params.toString();

    navigateTo(query ? `/exercises?${query}` : '/exercises');
  };

  const handleClear = () => {
    navigateTo('/exercises');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto gap-2 rounded-none p-0 text-[#667085] hover:bg-transparent active:translate-y-0"
        >
          <ListFilter className="size-5" />
          <span className="text-[16px] leading-6 font-medium">
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-5 rounded-[18px]">
        <DialogHeader>
          <DialogTitle>Filter exercises</DialogTitle>
          <DialogDescription>
            Use SQL conditions to search by name, muscle group, and equipment.
          </DialogDescription>
        </DialogHeader>

        <form
          action="/exercises"
          method="get"
          onSubmit={handleSubmit}
          className="grid gap-3"
        >
          <Input
            type="search"
            name="q"
            defaultValue={filters.q ?? ''}
            placeholder="Search exercises..."
            className="h-10 rounded-xl bg-white text-[15px]"
          />

          <div className="grid grid-cols-2 gap-2">
            <FilterCombobox
              name="muscleGroup"
              value={muscleGroupValue}
              onValueChange={setMuscleGroupValue}
              items={filterOptions.muscleGroups}
              allLabel="All muscle groups"
              emptyLabel="No muscle groups found."
              placeholder="All muscle groups"
              portalContainer={comboboxPortalRef}
            />

            <FilterCombobox
              name="equipment"
              value={equipmentValue}
              onValueChange={setEquipmentValue}
              items={filterOptions.equipment}
              allLabel="All equipment"
              emptyLabel="No equipment found."
              placeholder="All equipment"
              portalContainer={comboboxPortalRef}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="h-10 flex-1 rounded-xl">
              Apply Filters
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClear}
              className="h-10 rounded-xl px-4"
            >
              Clear
            </Button>
          </div>
        </form>
        <div ref={comboboxPortalRef} />
      </DialogContent>
    </Dialog>
  );
}

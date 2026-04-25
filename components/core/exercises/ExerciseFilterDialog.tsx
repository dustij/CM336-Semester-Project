'use client';

import { Button } from '@/components/ui/button';
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
import Link from 'next/link';

type ExerciseFilterDialogProps = {
  filters: ExerciseCatalogFilters;
  filterOptions: ExerciseFilterOptions;
};

export function ExerciseFilterDialog({
  filters,
  filterOptions,
}: ExerciseFilterDialogProps) {
  const activeFilterCount = [
    filters.q,
    filters.equipment,
    filters.muscleGroup,
  ].filter(Boolean).length;

  return (
    <Dialog>
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

        <form action="/exercises" className="grid gap-3">
          <Input
            type="search"
            name="q"
            defaultValue={filters.q ?? ''}
            placeholder="Search exercises..."
            className="h-10 rounded-xl bg-white text-[15px]"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              name="muscleGroup"
              defaultValue={filters.muscleGroup ?? ''}
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 rounded-xl border bg-white px-3 text-[14px] font-medium text-[#667085] outline-none focus-visible:ring-3"
            >
              <option value="">All muscle groups</option>
              {filterOptions.muscleGroups.map((muscleGroup) => (
                <option key={muscleGroup} value={muscleGroup}>
                  {muscleGroup}
                </option>
              ))}
            </select>

            <select
              name="equipment"
              defaultValue={filters.equipment ?? ''}
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 rounded-xl border bg-white px-3 text-[14px] font-medium text-[#667085] outline-none focus-visible:ring-3"
            >
              <option value="">All equipment</option>
              {filterOptions.equipment.map((equipment) => (
                <option key={equipment} value={equipment}>
                  {equipment}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="h-10 flex-1 rounded-xl">
              Apply SQL Filters
            </Button>
            <Button
              type="button"
              variant="secondary"
              asChild
              className="h-10 rounded-xl px-4"
            >
              <Link href="/exercises">Clear</Link>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

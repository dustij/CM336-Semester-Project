'use client';

import {
  createMesocycleTemplateAction,
  type CreateMesocycleTemplateActionState,
} from '@/app/(main)/mesocycles/new/actions';
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MesocycleDayDraft } from '@/lib/core/types';
import { ArrowLeft } from 'lucide-react';
import { useActionState, useRef, useState } from 'react';

type FinalizeMesocycleDialogProps = {
  disabled: boolean;
  mesocycleDays: MesocycleDayDraft[];
};

const WEEK_OPTIONS = Array.from({ length: 12 }, (_, index) => `${index + 1}`);

const initialState: CreateMesocycleTemplateActionState = {};

export default function FinalizeMesocycleDialog({
  disabled,
  mesocycleDays,
}: FinalizeMesocycleDialogProps) {
  const [state, formAction, pending] = useActionState(
    createMesocycleTemplateAction,
    initialState
  );
  const [title, setTitle] = useState('');
  const [durationWeeks, setDurationWeeks] = useState<string | null>(null);
  const comboboxPortalRef = useRef<HTMLDivElement | null>(null);
  const canCreate = title.trim().length > 0 && durationWeeks != null;
  const templateDays = mesocycleDays.map((day) => ({
    dayOfWeek: day.dayOfWeek,
    exerciseIds: day.plannedExercises.map((exercise) => exercise.id),
  }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="min-w-20" disabled={disabled}>
          Create
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="gap-4 rounded-[12px]">
        <DialogHeader className="text-body">
          <DialogTitle>Finalize Your Mesocycle</DialogTitle>
          <DialogDescription className="sr-only">
            Name the mesocycle and choose how many weeks it will last.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <input
            type="hidden"
            name="templateDays"
            value={JSON.stringify(templateDays)}
          />

          <div className="grid gap-2">
            <Label htmlFor="mesocycle-title" className="text-body text-xs">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mesocycle-title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-9 rounded-[8px] bg-white"
              maxLength={255}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mesocycle-weeks" className="text-body text-xs">
              Weeks <span className="text-destructive">*</span>
            </Label>
            <Combobox
              name="durationWeeks"
              items={WEEK_OPTIONS}
              value={durationWeeks}
              onValueChange={setDurationWeeks}
              itemToStringLabel={(weeks) =>
                `${weeks} week${weeks === '1' ? '' : 's'}`
              }
              itemToStringValue={(weeks) => weeks}
            >
              <ComboboxInput
                id="mesocycle-weeks"
                placeholder="Choose..."
                className="text-body h-9 rounded-[8px] bg-white"
                required
              />
              <ComboboxContent container={comboboxPortalRef}>
                <ComboboxEmpty>No weeks found.</ComboboxEmpty>
                <ComboboxList>
                  {(weeks) => (
                    <ComboboxItem
                      key={weeks}
                      value={weeks}
                      className="text-md text-body"
                    >
                      {weeks} week{weeks === '1' ? '' : 's'}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {state?.message && (
            <p className="text-destructive text-sm">{state.message}</p>
          )}

          <div className="flex items-center justify-between pt-1">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="text-body px-0 hover:bg-transparent"
              >
                <ArrowLeft className="size-[18px]" />
                Back
              </Button>
            </DialogClose>
            <Button type="submit" size="lg" disabled={!canCreate || pending}>
              {pending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
        <div ref={comboboxPortalRef} />
      </DialogContent>
    </Dialog>
  );
}

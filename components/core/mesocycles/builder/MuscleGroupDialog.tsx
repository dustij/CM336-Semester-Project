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
import { MuscleGroup } from '@/db/repository/muscle_group_repository';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

type MuscleGroupDialogProps = {
  description?: string;
  muscleGroups: MuscleGroup[];
  onSelect: (muscleGroup: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  title?: string;
  trigger?: ReactNode;
};

export default function MuscleGroupDialog({
  description = "Select a muscle group to add it to this day's planned exercises.",
  muscleGroups,
  onSelect,
  open,
  onOpenChange,
  showTrigger = true,
  title = 'Choose a muscle group',
  trigger,
}: MuscleGroupDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const handleSelect = (muscleGroup: string) => {
    onSelect(muscleGroup);
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              variant="ghost"
              size="lg"
              className="text-body text-md size-full"
            >
              <Plus className="size-[20px]" />
              Add a muscle group
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader className="text-body">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          {muscleGroups.map((muscleGroup) => (
            <Button
              key={`${muscleGroup.id}-${muscleGroup.name}`}
              variant="secondary"
              size="lg"
              onClick={() => handleSelect(muscleGroup.name)}
            >
              {muscleGroup.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

type MuscleGroupDialogProps = {
  muscleGroups: string[];
  onSelect: (muscleGroup: string) => void;
};

export default function MuscleGroupDialog({
  muscleGroups,
  onSelect,
}: MuscleGroupDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (muscleGroup: string) => {
    onSelect(muscleGroup);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="text-body text-md size-full"
        >
          <Plus className="size-[20px]" />
          Add a muscle group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-body">
          <DialogTitle>Choose a muscle group</DialogTitle>
          <DialogDescription>
            Select a muscle group to add it to this day&apos;s planned
            exercises.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          {muscleGroups.map((muscleGroup) => (
            <Button
              key={muscleGroup}
              variant="secondary"
              size="lg"
              onClick={() => handleSelect(muscleGroup)}
            >
              {muscleGroup}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

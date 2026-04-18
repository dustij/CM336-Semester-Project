'use client';

import { Plus } from 'lucide-react';
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
};

export default function MuscleGroupDialog({
  muscleGroups,
}: MuscleGroupDialogProps) {
  return (
    <Dialog>
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
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          {muscleGroups.map((muscleGroup) => (
            <Button key={muscleGroup} variant="secondary" size="lg">
              {muscleGroup}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  EllipsisVertical,
  Trash,
} from 'lucide-react';

export default function InstanceExerciseCard() {
  return (
    <div className="flex flex-col gap-2.5 rounded-[8px] bg-white p-2.5 shadow">
      <div className="flex items-center justify-between">
        <div className="bg-my-secondary rounded-[8px] px-2 py-1">
          <p className="text-my-secondary-foreground">Muscle</p>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonVariants({ variant: 'ghost', size: 'icon-xl' })}
              aria-label="Mesocycle options"
            >
              <EllipsisVertical className="text-body size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <DropdownMenuItem onClick={() => {}}>
                <ArrowLeftRight className="size-4" />
                Change
              </DropdownMenuItem>
              <DropdownMenuItem disabled={false} onClick={() => {}}>
                <ArrowUp className="size-4" />
                Move up
              </DropdownMenuItem>
              <DropdownMenuItem disabled={false} onClick={() => {}}>
                <ArrowDown className="size-4" />
                Move down
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => {}}>
                <Trash className="size-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-heading truncate leading-tight">Exercise</p>
        <p className="text-caption truncate text-sm">Equipment</p>
      </div>
    </div>
  );
}

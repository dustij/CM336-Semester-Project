'use client';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy, EllipsisVertical, Pencil, Timer, Trash } from 'lucide-react';

type MesocycleCardProps = {
  id: number;
  title: string;
  duration_weeks: number;
  days_per_week: number;
};
export default function MesocycleCard({
  id,
  title,
  duration_weeks,
  days_per_week,
}: MesocycleCardProps) {
  const onStartNewInstance = () => {};
  const onRenameTemplate = () => {};
  const onDuplicateTemplate = () => {};
  const onRemoveTemplate = () => {};
  return (
    <div className="flex items-center justify-between rounded-[8px] bg-white px-4 py-2.5 shadow">
      {/* Title and Description */}
      <div className="flex grow flex-col gap-1">
        <div>
          <p className="text-heading text-base">{title}</p>
        </div>
        <div>
          <p className="text-caption text-xs">{`${duration_weeks} WEEKS - ${days_per_week} DAYS/WEEK`}</p>
        </div>
      </div>
      {/* Options Button */}
      <div className="flex shrink items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={buttonVariants({ variant: 'ghost', size: 'icon-xl' })}
            aria-label="Planned exercise options"
          >
            <EllipsisVertical className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuItem onClick={onStartNewInstance}>
              <Timer className="size-4" />
              Start
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRenameTemplate}>
              <Pencil className="size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicateTemplate}>
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onRemoveTemplate}>
              <Trash className="size-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

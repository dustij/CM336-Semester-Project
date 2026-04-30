'use client';

import { removeMesocycleTemplateAction } from '@/app/(main)/mesocycles/actions';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Copy,
  EllipsisVertical,
  Eye,
  Pencil,
  Timer,
  Trash,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RenameMesocycleDialog from './RenameMesocycleDialog';

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
  const router = useRouter();
  const [titleState, setTitleState] = useState(title);
  const [savedTitle, setSavedTitle] = useState(title);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    setTitleState(title);
    setSavedTitle(title);
  }, [title]);

  const handleRenameTemplate = () => {
    setIsRenameDialogOpen(true);
  };
  const handleOptimisticTitle = useCallback((newTitle: string) => {
    setTitleState(newTitle);
  }, []);
  const handleRenameSuccess = useCallback((newTitle: string) => {
    setTitleState(newTitle);
    setSavedTitle(newTitle);
  }, []);
  const handleRenameError = useCallback(() => {
    setTitleState(savedTitle);
  }, [savedTitle]);
  const handleStartNewInstance = () => {};
  const handleDuplicateTemplate = () => {
    router.push(`/mesocycles/${id}/duplicate`);
  };
  const handleRemoveTemplate = () => {
    setIsRemoved(true);

    window.setTimeout(() => {
      void removeMesocycleTemplateAction(id)
        .then((result) => {
          if (result.status !== 'success') {
            setIsRemoved(false);
          }
        })
        .catch((error) => {
          console.error('Failed to remove mesocycle template.', error);
          setIsRemoved(false);
        });
    }, 0);
  };
  const handleViewTemplate = () => {
    router.push(`/mesocycles/${id}`);
  };

  if (isRemoved) {
    return null;
  }

  return (
    <>
      {isRenameDialogOpen && (
        <RenameMesocycleDialog
          open={isRenameDialogOpen}
          templateId={id}
          initialTitle={savedTitle}
          savedTitle={savedTitle}
          onOpenChange={setIsRenameDialogOpen}
          onOptimisticTitle={handleOptimisticTitle}
          onRenameSuccess={handleRenameSuccess}
          onRenameError={handleRenameError}
        />
      )}

      <div className="flex items-center justify-between rounded-[8px] bg-white px-4 py-2.5 shadow">
        {/* Title and Description */}
        <div className="flex grow flex-col gap-1">
          <div>
            <p className="text-heading text-base">{titleState}</p>
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
              aria-label="Mesocycle options"
            >
              <EllipsisVertical className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <DropdownMenuItem onClick={handleStartNewInstance}>
                <Timer className="size-4" />
                Start
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRenameTemplate}>
                <Pencil className="size-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewTemplate}>
                <Eye className="size-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicateTemplate}>
                <Copy className="size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={handleRemoveTemplate}
              >
                <Trash className="size-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}

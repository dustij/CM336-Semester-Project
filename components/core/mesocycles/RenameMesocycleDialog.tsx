'use client';

import { renameMesocycleTemplateAction } from '@/app/(main)/mesocycles/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

type RenameMesocycleDialogProps = {
  open: boolean;
  templateId: number;
  initialTitle: string;
  savedTitle: string;
  onOpenChange: (open: boolean) => void;
  onOptimisticTitle: (title: string) => void;
  onRenameSuccess: (title: string) => void;
  onRenameError: () => void;
};

export default function RenameMesocycleDialog({
  open,
  templateId,
  initialTitle,
  savedTitle,
  onOpenChange,
  onOptimisticTitle,
  onRenameSuccess,
  onRenameError,
}: RenameMesocycleDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const canRename = title.trim().length > 0;

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const submitRename = async (formData: FormData) => {
    try {
      const result = await renameMesocycleTemplateAction(templateId, formData);

      if (result.status === 'success' && result.title) {
        onRenameSuccess(result.title);
        return;
      }
    } catch (error) {
      console.error('Failed to rename mesocycle template.', error);
      onRenameError();
      return;
    }

    onRenameError();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const newTitle = `${formData.get('newTitle') ?? ''}`.trim();

    if (!newTitle) {
      return;
    }

    onOptimisticTitle(newTitle);
    onOpenChange(false);

    window.setTimeout(() => {
      void submitRename(formData);
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-4 rounded-[12px]">
        <DialogHeader className="text-body">
          <DialogTitle>Rename Mesocycle</DialogTitle>
          <DialogDescription className="sr-only">
            Rename the mesocycle template.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label
              htmlFor={`rename-mesocycle-title-${templateId}`}
              className="text-body text-xs"
            >
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`rename-mesocycle-title-${templateId}`}
              name="newTitle"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-9 rounded-[8px] bg-white"
              maxLength={255}
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="text-body"
                onClick={() => onOptimisticTitle(savedTitle)}
              >
                <ArrowLeft className="size-[18px]" />
                Back
              </Button>
            </DialogClose>
            <Button type="submit" size="lg" disabled={!canRename}>
              Rename
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

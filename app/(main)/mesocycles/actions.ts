'use server';

import { renameMesocycleTemplate } from '@/db/repository/mesocycle_repository';
import { verifySession } from '@/lib/session';
import { updateTag } from 'next/cache';

export type RenameMesocycleTemplateActionState = {
  status?: 'success' | 'error';
  message?: string;
  title?: string;
};

const TITLE_MAX_LENGTH = 255;

export async function renameMesocycleTemplateAction(
  templateId: number,
  formData: FormData
): Promise<RenameMesocycleTemplateActionState> {
  const { userId } = await verifySession();
  const newTitle = `${formData.get('newTitle') ?? ''}`.trim();

  if (!Number.isInteger(templateId) || templateId <= 0) {
    return {
      status: 'error',
      message: 'Could not find the mesocycle template.',
    };
  }

  if (!newTitle) {
    return { status: 'error', message: 'Name is required.' };
  }

  if (newTitle.length > TITLE_MAX_LENGTH) {
    return {
      status: 'error',
      message: `Name must be ${TITLE_MAX_LENGTH} characters or fewer.`,
    };
  }

  try {
    await renameMesocycleTemplate({
      userId,
      templateId,
      newTitle,
    });
  } catch (error) {
    console.error('Failed to rename mesocycle instance.', error);
    return {
      status: 'error',
      message: 'Could not rename the mesocycle. Please try again.',
    };
  }

  updateTag(`mesocycles:user:${userId}`);

  return {
    status: 'success',
    title: newTitle,
  };
}

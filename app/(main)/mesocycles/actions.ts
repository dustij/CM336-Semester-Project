'use server';

import {
  removeMesocycleTemplate,
  renameMesocycleTemplate,
} from '@/db/repository/mesocycle_repository';
import { verifySession } from '@/lib/session';
import { updateTag } from 'next/cache';
import { setTimeout } from 'timers/promises';

export type RenameMesocycleTemplateActionState = {
  status?: 'success' | 'error';
  message?: string;
  title?: string;
};

export type GeneralMesocycleTemplateActionState = {
  status?: 'success' | 'error';
  message?: string;
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

export async function removeMesocycleTemplateAction(
  templateId: number
): Promise<GeneralMesocycleTemplateActionState> {
  const { userId } = await verifySession();

  if (!Number.isInteger(templateId) || templateId <= 0) {
    return {
      status: 'error',
      message: 'Could not find the mesocycle template.',
    };
  }

  try {
    await removeMesocycleTemplate({
      userId,
      templateId,
    });
  } catch (error) {
    console.error('Failed to remove mesocycle template.', error);
    return {
      status: 'error',
      message: 'Could not remove the mesocycle. Please try again.',
    };
  }

  updateTag(`mesocycles:user:${userId}`);

  return {
    status: 'success',
  };
}

export async function setNewCurrentAction(
  templateId: number
): Promise<GeneralMesocycleTemplateActionState> {
  await verifySession();

  await setTimeout(2000);

  if (!Number.isInteger(templateId) || templateId <= 0) {
    return {
      status: 'error',
      message: 'Could not find the mesocycle template.',
    };
  }

  return { status: 'success' };
}

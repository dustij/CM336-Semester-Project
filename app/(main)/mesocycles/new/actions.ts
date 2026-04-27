'use server';

import {
  createMesocycleTemplate,
  type CreateMesocycleTemplateInput,
} from '@/db/repository/mesocycle_repository';
import type { Weekday } from '@/lib/core/types';
import { verifySession } from '@/lib/session';
import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export type CreateMesocycleTemplateActionState = {
  message?: string;
};

const WEEKDAYS: Weekday[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

function isWeekday(value: unknown): value is Weekday {
  return typeof value === 'string' && WEEKDAYS.includes(value as Weekday);
}

function parseTemplateDays(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function getValidatedTemplateInput(
  userId: number,
  formData: FormData
): CreateMesocycleTemplateInput | { message: string } {
  const title = `${formData.get('title') ?? ''}`.trim();
  const durationWeeks = Number(formData.get('durationWeeks'));
  const days = parseTemplateDays(formData.get('templateDays'));

  if (!title) {
    return { message: 'Name is required.' };
  }

  if (title.length > 255) {
    return { message: 'Name must be 255 characters or fewer.' };
  }

  if (
    !Number.isInteger(durationWeeks) ||
    durationWeeks < 1 ||
    durationWeeks > 12
  ) {
    return { message: 'Choose a duration between 1 and 12 weeks.' };
  }

  if (!Array.isArray(days) || days.length < 1 || days.length > 7) {
    return { message: 'Add between 1 and 7 training days.' };
  }

  const seenDays = new Set<Weekday>();
  const validatedDays: CreateMesocycleTemplateInput['days'] = [];

  for (const day of days) {
    if (typeof day !== 'object' || day === null) {
      return { message: 'Each day needs a weekday.' };
    }

    const rawDay = day as {
      dayOfWeek?: unknown;
      exerciseIds?: unknown;
    };

    if (!isWeekday(rawDay.dayOfWeek)) {
      return { message: 'Each day needs a weekday.' };
    }

    if (seenDays.has(rawDay.dayOfWeek)) {
      return { message: 'Each weekday can only be used once.' };
    }

    seenDays.add(rawDay.dayOfWeek);

    if (!Array.isArray(rawDay.exerciseIds) || rawDay.exerciseIds.length === 0) {
      return { message: 'Each day needs at least one exercise.' };
    }

    const plannedExercises = rawDay.exerciseIds.map((exerciseId) => ({
      exerciseId: Number(exerciseId),
    }));

    if (
      plannedExercises.some(
        (exercise) =>
          !Number.isInteger(exercise.exerciseId) || exercise.exerciseId <= 0
      )
    ) {
      return { message: 'Each muscle group needs an exercise.' };
    }

    validatedDays.push({
      dayOfWeek: rawDay.dayOfWeek,
      plannedExercises,
    });
  }

  return {
    userId,
    title,
    durationWeeks,
    days: validatedDays,
  };
}

export async function createMesocycleTemplateAction(
  _prevState: CreateMesocycleTemplateActionState | undefined,
  formData: FormData
): Promise<CreateMesocycleTemplateActionState> {
  const { userId } = await verifySession();
  const input = getValidatedTemplateInput(userId, formData);

  if ('message' in input) {
    return input;
  }

  try {
    await createMesocycleTemplate(input);
  } catch (error) {
    console.error('Failed to create mesocycle template.', error);
    return { message: 'Could not create the mesocycle. Please try again.' };
  }

  updateTag(`mesocycles:user:${userId}`);
  redirect('/mesocycles');
}

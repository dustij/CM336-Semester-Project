import 'server-only';

import * as db from '@/db/server/db';
import {
  insertMesocycleTemplate,
  selectMesocycleListByUser,
} from '@/db/sql/ts/mesocycle_template/query';
import { insertPlannedExercise } from '@/db/sql/ts/planned_exercise/query';
import { insertTemplateDay } from '@/db/sql/ts/template_day/query';
import type { MesocycleListItem, Weekday } from '@/lib/core/types';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { cacheLife, cacheTag } from 'next/cache';

type MesocycleListRow = RowDataPacket & MesocycleListItem;

export type CreateMesocycleTemplateInput = {
  userId: number;
  title: string;
  durationWeeks: number;
  days: {
    dayOfWeek: Weekday;
    plannedExercises: {
      exerciseId: number;
    }[];
  }[];
};

export async function getCurrentMesocycle(userId: number) {
  'use cache';
  cacheTag(`mesocycles:user:${userId}`);
  cacheLife('max'); // max because we manually invalidate after user selects a mesocycle as current
  return null;
}

export async function getMesocycleList(
  userId: number
): Promise<MesocycleListItem[]> {
  'use cache';
  cacheTag(`mesocycles:user:${userId}`);
  cacheLife('max'); // max because we manually invalidate after user adds a new mesocycle
  try {
    const result = (await db.query(selectMesocycleListByUser, [
      userId,
    ])) as MesocycleListRow[];

    return result.map((template) => ({
      id: template.id,
      title: template.title,
      durationWeeks: template.duration_weeks,
      daysPerWeek: template.days_per_week,
    }));
  } catch (error) {
    console.error('Failed to fetch mesocycle list.', error);
    return [];
  }
}

export async function createMesocycleTemplate({
  userId,
  title,
  durationWeeks,
  days,
}: CreateMesocycleTemplateInput): Promise<number> {
  return await db.transaction(async (query) => {
    const templateResult = (await query(insertMesocycleTemplate, [
      userId,
      title,
      durationWeeks,
    ])) as ResultSetHeader;
    const templateId = templateResult.insertId;

    for (const [dayOrder, day] of days.entries()) {
      const dayResult = (await query(insertTemplateDay, [
        templateId,
        day.dayOfWeek,
        dayOrder,
      ])) as ResultSetHeader;
      const templateDayId = dayResult.insertId;

      for (const [exerciseOrder, exercise] of day.plannedExercises.entries()) {
        await query(insertPlannedExercise, [
          exercise.exerciseId,
          templateDayId,
          exerciseOrder,
        ]);
      }
    }

    return templateId;
  });
}

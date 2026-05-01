import 'server-only';

import * as db from '@/db/server/db';
import {
  insertMesocycleTemplate,
  selectMesocycleListByUser,
  selectMesocycleTemplateById,
  setMesocycleTemplateAsDeleted,
  setNewCurrentForUserId,
  updateMesocycleTemplateTitle,
} from '@/db/sql/ts/mesocycle_template/query';
import { insertPlannedExercise } from '@/db/sql/ts/planned_exercise/query';
import { insertTemplateDay } from '@/db/sql/ts/template_day/query';
import type {
  MesocycleDayDraft,
  MesocycleListItem,
  Weekday,
} from '@/lib/core/types';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { cacheLife, cacheTag } from 'next/cache';

type MesocycleListRow = RowDataPacket & MesocycleListItem;
type MesocycleTemplateRow = RowDataPacket & {
  template_id: number;
  title: string;
  duration_weeks: number;
  template_day_id: number | null;
  day_of_week: Weekday | null;
  day_order: number | null;
  planned_exercise_id: number | null;
  exercise_order: number | null;
  exercise_id: number | null;
  exercise_name: string | null;
  equipment: string | null;
  muscle_group: string | null;
};

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

export type RenameMesocycleTemplateInput = {
  userId: number;
  templateId: number;
  newTitle: string;
};

export type MesocycleTemplateDetail = {
  id: number;
  title: string;
  durationWeeks: number;
  days: MesocycleDayDraft[];
};

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

export async function getMesocycleTemplate(
  userId: number,
  templateId: number
): Promise<MesocycleTemplateDetail | null> {
  'use cache';
  cacheTag(`mesocycles:user:${userId}`);
  cacheLife('max');

  try {
    const rows = (await db.query(selectMesocycleTemplateById, [
      templateId,
      userId,
    ])) as MesocycleTemplateRow[];

    const template = rows[0];

    if (template == null) {
      return null;
    }

    const daysById = new Map<number, MesocycleDayDraft>();

    for (const row of rows) {
      if (
        row.template_day_id == null ||
        row.day_of_week == null ||
        row.day_order == null
      ) {
        continue;
      }

      const day =
        daysById.get(row.template_day_id) ??
        ({
          dayOfWeek: row.day_of_week,
          dayOrder: row.day_order,
          plannedExercises: [],
        } satisfies MesocycleDayDraft);

      if (!daysById.has(row.template_day_id)) {
        daysById.set(row.template_day_id, day);
      }

      if (
        row.exercise_id == null ||
        row.exercise_order == null ||
        row.muscle_group == null
      ) {
        continue;
      }

      day.plannedExercises.push({
        id: row.exercise_id,
        name: row.exercise_name,
        equipment: row.equipment,
        exerciseOrder: row.exercise_order,
        exerciseType: '',
        muscleGroup: row.muscle_group,
      });
    }

    return {
      id: template.template_id,
      title: template.title,
      durationWeeks: template.duration_weeks,
      days: Array.from(daysById.values()).sort(
        (a, b) => a.dayOrder - b.dayOrder
      ),
    };
  } catch (error) {
    console.error('Failed to fetch mesocycle template.', error);
    return null;
  }
}

export async function setMesocycleTemplateAsCurrent(input: {
  userId: number;
  templateId: number;
}) {
  await db.query(setNewCurrentForUserId, [input.templateId, input.userId]);
}

export async function renameMesocycleTemplate(
  input: RenameMesocycleTemplateInput
) {
  const result = (await db.query(updateMesocycleTemplateTitle, [
    input.newTitle,
    input.templateId,
    input.userId,
  ])) as ResultSetHeader;

  if (result.affectedRows !== 1) {
    throw new Error('Mesocycle template not found.');
  }
}

export async function removeMesocycleTemplate(input: {
  userId: number;
  templateId: number;
}) {
  const result = (await db.query(setMesocycleTemplateAsDeleted, [
    input.templateId,
    input.userId,
  ])) as ResultSetHeader;

  if (result.affectedRows !== 1) {
    throw new Error('Mesocycle template not found.');
  }
}

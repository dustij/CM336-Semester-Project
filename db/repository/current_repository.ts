import 'server-only';

import * as db from '@/db/server/db';
import type { Weekday } from '@/lib/core/types';
import type { RowDataPacket } from 'mysql2';
import { cacheLife, cacheTag } from 'next/cache';
import { selectCurrentInstanceByUserId } from '../sql/ts/mesocycle_instance/query';

/**
 * 
 Current mesocycle instance flow:

When a user starts a mesocycle template, the app creates one mesocycle_instance 
row and marks it as the user's current instance. The app also creates the first 
instance_day row for week 1 using the first template_day in day_order sequence.

Instance days are not created all at once. They are created progressively as the 
user moves through the mesocycle.

Each instance_day represents one scheduled workout day from the template for a 
specific week. For example, a 3-week template with 3 days per week can produce 
up to 9 instance_day rows by the time the cycle is finished.

When the current instance_day is updated to either COMPLETED or ABANDONED, the 
database should create the next instance_day for the same mesocycle_instance. 
The next day is determined from the template_day ordering:

- If there is another template_day later in the same week, create an 
instance_day for that template_day with the same week_number.

- If the current day is the last template_day of the week and the mesocycle has 
more weeks remaining, create an instance_day for the first template_day with 
week_number + 1.

- If the current day is the last template_day of the final week, no new 
instance_day is created and the mesocycle_instance can be considered complete.

The instance_day status controls progression:
- PLANNED: scheduled/current day
- COMPLETED: user finished the day
- ABANDONED: user skipped/ended the day, but progression should still continue

Both COMPLETED and ABANDONED advance the mesocycle to the next scheduled 
template day. Other statuses should not trigger creation of the next 
instance_day.


 */

type InstanceDayStatus = 'PLANNED' | 'COMPLETED' | 'ABANDONED';

type CurrentInstanceRow = RowDataPacket & {
  instance_id: number;
  template_id: number;
  user_id: number;
  instance_start_date: Date;
  instance_end_date: Date | null;
  is_current: boolean;
  title: string;
  duration_weeks: number;
  instance_day_id: number;
  week_number: number;
  instance_day_end_date: Date | null;
  status: InstanceDayStatus;
  template_day_id: number;
  day_of_week: Weekday;
  day_order: number;
};

export type CurrentInstanceDay = {
  id: number;
  templateDayId: number;
  weekNumber: number;
  dayOfWeek: Weekday;
  dayOrder: number;
  status: InstanceDayStatus;
  endDate: Date | null;
  templateTitle: string;
};

export type CurrentMesocycleInstanceDetails = {
  id: number;
  templateId: number;
  userId: number;
  title: string;
  durationWeeks: number;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  days: CurrentInstanceDay[];
};

export async function getCurrentMesocycleInstanceDetails(
  userId: number
): Promise<CurrentMesocycleInstanceDetails | null> {
  'use cache';
  cacheTag(`mesocycles:user:${userId}`);
  cacheLife('max'); // max because we manually invalidate after user selects a mesocycle as current

  const rows = (await db.query(selectCurrentInstanceByUserId, [
    userId,
  ])) as CurrentInstanceRow[];

  const instance = rows[0];

  if (instance == null) {
    return null;
  }

  return {
    id: instance.instance_id,
    templateId: instance.template_id,
    userId: instance.user_id,
    title: instance.title,
    durationWeeks: instance.duration_weeks,
    startDate: instance.instance_start_date,
    endDate: instance.instance_end_date,
    isCurrent: Boolean(instance.is_current),
    days: rows.map((row) => ({
      id: row.instance_day_id,
      templateDayId: row.template_day_id,
      weekNumber: row.week_number,
      dayOfWeek: row.day_of_week,
      dayOrder: row.day_order,
      status: row.status,
      endDate: row.instance_day_end_date,
      templateTitle: row.title,
    })),
  };
}

export async function getCurrentInstanceDay(
  userId: number
): Promise<CurrentInstanceDay | null> {
  'use cache';
  cacheTag(`mesocycles:user:${userId}`);
  cacheLife('max');

  const currentInstance = await getCurrentMesocycleInstanceDetails(userId);

  if (currentInstance == null) {
    return null;
  }

  return currentInstance.days.find((day) => day.status === 'PLANNED') ?? null;
}

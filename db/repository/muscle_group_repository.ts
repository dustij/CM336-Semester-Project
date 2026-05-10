import 'server-only';

import * as db from '@/db/server/db';
import type { RowDataPacket } from 'mysql2';
import { cacheLife, cacheTag } from 'next/cache';
import { selectAllMuscleGroups } from '../sql/ts/muscle_group/query';

export type MuscleGroup = { id: number; name: string };
type MuscleGroupRow = RowDataPacket & MuscleGroup;

const MUSCLE_GROUP_FALLBACK: MuscleGroup[] = [
  { id: 1, name: 'Back' },
  { id: 2, name: 'Cardio' },
  { id: 3, name: 'Chest' },
  { id: 4, name: 'Lower Arms' },
  { id: 5, name: 'Lower Legs' },
  { id: 6, name: 'Neck' },
  { id: 7, name: 'Shoulders' },
  { id: 8, name: 'Upper Arms' },
  { id: 9, name: 'Upper Legs' },
  { id: 10, name: 'Waist' },
];

function hasDatabaseConfig() {
  return Boolean(process.env['MYSQL_URI']);
}

export async function getMuscleGroupList(): Promise<MuscleGroup[]> {
  'use cache';
  cacheTag(`mesocycles:muscleGroups`);
  cacheLife('days'); // days because muscle groups may be updated but not often

  if (!hasDatabaseConfig()) {
    return MUSCLE_GROUP_FALLBACK;
  }

  try {
    const result = (await db.query(selectAllMuscleGroups)) as MuscleGroupRow[];
    const muscleGroups = result.map((mg) => ({
      id: mg.id,
      name: mg.name,
    }));

    return muscleGroups.length > 0 ? muscleGroups : MUSCLE_GROUP_FALLBACK;
  } catch (error) {
    console.error('Failed to fetch muscle groups.', error);
    return MUSCLE_GROUP_FALLBACK;
  }
}

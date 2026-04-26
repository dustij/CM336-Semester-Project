import 'server-only';

import * as db from '@/db/server/db';
import type { RowDataPacket } from 'mysql2';
import { cacheLife, cacheTag } from 'next/cache';
import { selectAllMuscleGroups } from '../sql/ts/muscle_group/query';

export type MuscleGroup = { id: number; name: string };
type MuscleGroupRow = RowDataPacket & MuscleGroup;

export async function getMuscleGroupList(): Promise<MuscleGroup[]> {
  'use cache';
  cacheTag(`mesocycles:muscleGroups`);
  cacheLife('days'); // days because muscle groups may be updated but not often

  try {
    const result = (await db.query(selectAllMuscleGroups)) as MuscleGroupRow[];
    return result.map((mg) => ({
      id: mg.id,
      name: mg.name,
    }));
  } catch (error) {
    console.error('Failed to fetch muscle groups.', error);
    return [];
  }
}

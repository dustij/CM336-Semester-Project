import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

export type MesocycleListItem = {
  id: number;
  title: string;
};

export async function getCurrentMesocycle(userId: number) {
  'use cache';
  cacheTag(`mesocycles:user:${userId}`);
  cacheLife('max'); // max because we manually invalidate after user selects a mesocycle as current
  return null;
}

export async function getMesocycleList(
  userId: number,
): Promise<MesocycleListItem[]> {
  'use cache';
  cacheTag(`mesocycles:user:${userId}`);
  cacheLife('max'); // max because we manually invalidate after user adds a new mesocycle
  return [];
}

export async function getMuscleGroupList() {
  'use cache';
  cacheTag(`mesocycles:muscleGroups`);
  cacheLife('max'); // max because muscle groups will only change if we (the developers) add more to the database

  return ['Chest', 'Back'];
}

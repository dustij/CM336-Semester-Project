import 'server-only';

import type { MesocycleListItem } from '@/lib/core/types';
import { cacheLife, cacheTag } from 'next/cache';

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
  return [];
}

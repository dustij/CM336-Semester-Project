import NewMesocyclePage from '@/components/core/NewMesocyclePage';
import { getMuscleGroupList } from '@/db/repository';
import { verifySession } from '@/lib/session';

export default async function New() {
  await verifySession();
  const muscleGroups = await getMuscleGroupList();

  return <NewMesocyclePage muscleGroups={muscleGroups} />;
}

import NewMesocyclePage from '@/components/core/mesocycles/builder/NewMesocyclePage';
import { getMuscleGroupList } from '@/db/repository';

export default async function New() {
  const muscleGroups = await getMuscleGroupList();

  return <NewMesocyclePage muscleGroups={muscleGroups} />;
}

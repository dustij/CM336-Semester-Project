import NewMesocyclePage from '@/components/core/mesocycles/builder/NewMesocyclePage';
import { getExerciseListsByMuscleGroup } from '@/db/repository/exercise_repository';
import { getMuscleGroupList } from '@/db/repository/muscle_group_repository';

export default async function New() {
  const muscleGroups = await getMuscleGroupList();
  const exercisesByMuscleGroup =
    await getExerciseListsByMuscleGroup(muscleGroups);

  return (
    <NewMesocyclePage
      muscleGroups={muscleGroups}
      exercisesByMuscleGroup={exercisesByMuscleGroup}
    />
  );
}

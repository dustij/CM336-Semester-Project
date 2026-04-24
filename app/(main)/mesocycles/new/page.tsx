import NewMesocyclePage from '@/components/core/mesocycles/builder/NewMesocyclePage';
import {
  getExerciseListsByMuscleGroup,
  getMuscleGroupList,
} from '@/db/repository/repository';

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

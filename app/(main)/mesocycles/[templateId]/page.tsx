import NewMesocyclePage from '@/components/core/mesocycles/builder/NewMesocyclePage';
import { getExerciseListsByMuscleGroup } from '@/db/repository/exercise_repository';
import { getMesocycleTemplate } from '@/db/repository/mesocycle_repository';
import { getMuscleGroupList } from '@/db/repository/muscle_group_repository';
import { verifySession } from '@/lib/session';
import { notFound } from 'next/navigation';

type ViewMesocyclePageProps = {
  params: Promise<{
    templateId: string;
  }>;
};

export default async function ViewMesocycle({
  params,
}: ViewMesocyclePageProps) {
  const { templateId } = await params;
  const parsedTemplateId = Number(templateId);

  if (!Number.isInteger(parsedTemplateId) || parsedTemplateId <= 0) {
    notFound();
  }

  const { userId } = await verifySession();
  const [muscleGroups, template] = await Promise.all([
    getMuscleGroupList(),
    getMesocycleTemplate(userId, parsedTemplateId),
  ]);

  if (template == null) {
    notFound();
  }

  const exercisesByMuscleGroup =
    await getExerciseListsByMuscleGroup(muscleGroups);

  return (
    <NewMesocyclePage
      muscleGroups={muscleGroups}
      exercisesByMuscleGroup={exercisesByMuscleGroup}
      initialMesocycleDays={template.days}
      readOnly
      title={template.title}
    />
  );
}

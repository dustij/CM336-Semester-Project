import NewMesocyclePage from '@/components/core/mesocycles/builder/NewMesocyclePage';
import { getExerciseListsByMuscleGroup } from '@/db/repository/exercise_repository';
import { getMesocycleTemplate } from '@/db/repository/mesocycle_repository';
import { getMuscleGroupList } from '@/db/repository/muscle_group_repository';
import { verifySession } from '@/lib/session';
import { notFound } from 'next/navigation';

type DuplicateMesocyclePageProps = {
  params: Promise<{
    templateId: string;
  }>;
};

export default async function DuplicateMesocycle({
  params,
}: DuplicateMesocyclePageProps) {
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
      initialDurationWeeks={template.durationWeeks}
      initialMesocycleDays={template.days}
      title={template.title}
    />
  );
}

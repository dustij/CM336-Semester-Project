import { Button } from '@/components/ui/button';
import { getCurrentInstanceDay } from '@/db/repository/current_mock_repository';
import Link from 'next/link';
import InstanceDay from './InstanceDay';

export default async function CurrentPage({ userId }: { userId: number }) {
  const currentMesocycle = await getCurrentInstanceDay(userId);

  if (!currentMesocycle) {
    return (
      <main className="bg-my-background flex flex-1 items-center justify-center px-5 py-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-body text-xl font-medium">No Active Mesocycle</p>
          <p className="text-body text-center">
            Please select a mesocycle to get started
          </p>
          <div className="my-4">
            <Link href={'/mesocycles'}>
              <Button size="lg">Choose Mesocycle</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <InstanceDay
      currentInstanceDayId={currentMesocycle.id}
      title={currentMesocycle.templateTitle}
      weekNumber={currentMesocycle.weekNumber}
      dayNumber={currentMesocycle.dayOrder}
      weekday={currentMesocycle.dayOfWeek}
      exercises={currentMesocycle.exercises}
      addedExercises={currentMesocycle.addedExercises}
    />
  );
}

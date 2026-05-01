import { Button } from '@/components/ui/button';
import { getMesocycleList } from '@/db/repository/mesocycle_repository';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import MesocycleCard from './MesocycleCard';

export default async function MesocyclesPage({ userId }: { userId: number }) {
  const mesocycleList = await getMesocycleList(userId);
  return (
    <main className="bg-my-background flex flex-1 flex-col items-center justify-center">
      <div className="flex w-full items-center px-5 py-3.5">
        <div className="flex-1">
          <p className="text-body text-lg font-semibold">Mesocycles</p>
        </div>
        <Link href="/mesocycles/new">
          <Button size="lg" className="min-w-20">
            <Plus />
            New
          </Button>
        </Link>
      </div>
      <div className="w-full flex-1 overflow-hidden overflow-y-auto px-5">
        {!mesocycleList || mesocycleList.length === 0 ? (
          // For smoke testing with Codex
          // <MesocycleCard
          //   id={0}
          //   title={'Full Body V1'}
          //   duration_weeks={4}
          //   days_per_week={4}
          // />

          // Empty - Display message
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <p className="text-body text-xl font-medium">No Mesocycles</p>
            <p className="text-body text-center">
              Click new to create your first mesocycle
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {
              // Not Empty - Show mesocycle cards
              mesocycleList.map((template) => (
                <MesocycleCard
                  key={`${template.id}-${template.title}`}
                  templateId={template.id}
                  title={template.title}
                  duration_weeks={template.durationWeeks}
                  days_per_week={template.daysPerWeek}
                />
              ))
            }
          </div>
        )}
      </div>
    </main>
  );
}

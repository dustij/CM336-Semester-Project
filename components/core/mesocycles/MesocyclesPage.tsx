import { Button } from '@/components/ui/button';
import { getMesocycleList } from '@/db/repository/repository';
import { Plus } from 'lucide-react';
import Link from 'next/link';

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
          // Empty - Display message
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <p className="text-body text-xl font-medium">No Mesocycles</p>
            <p className="text-body text-center">
              Click new to create your first mesocycle
            </p>
          </div>
        ) : (
          // Not Empty - Show mesocycle cards
          mesocycleList.map((template, i) => (
            <div key={i} className="h-20">
              {template.title}
            </div>
          ))
        )}
      </div>
    </main>
  );
}

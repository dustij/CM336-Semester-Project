import { getCurrentMesocycle } from '@/db/repository';
import Link from 'next/link';
import { Button } from '../ui/button';

export default async function CurrentPage({ userId }: { userId: number }) {
  const currentMesocycle = await getCurrentMesocycle(userId);

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

  return <main className="bg-my-background"></main>;
}

import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

export default function MesocyclesPage() {
  return (
    // <main className="bg-my-background flex flex-1 flex-col items-center justify-center gap-4 px-5 pt-4">
    <main className="bg-my-background flex flex-1 flex-col items-center justify-center">
      <div className="flex w-full items-center px-5 py-3.5">
        <div className="flex-1">
          <p className="text-lg font-semibold">Mesocycles</p>
        </div>
        <Button size="lg" className="min-w-20">
          <Plus />
          New
        </Button>
        <div></div>
      </div>
      <div className="w-full flex-1 px-5"></div>
    </main>
  );
}

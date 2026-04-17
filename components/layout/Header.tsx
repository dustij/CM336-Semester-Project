import { LogOut } from 'lucide-react';

import { logout } from '@/app/(main)/actions';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white px-5 py-4">
      <div className="mx-auto flex w-full items-center justify-between">
        <div>
          <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
            Mesocycle Planner
          </p>
        </div>

        <form action={logout}>
          <Button type="submit" variant="ghost" className="cursor-pointer">
            <LogOut className="size-4" />
            Log Out
          </Button>
        </form>
      </div>
    </header>
  );
}

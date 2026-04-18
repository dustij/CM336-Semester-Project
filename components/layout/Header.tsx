import { logout } from '@/app/(main)/actions';
import { LogOutIcon, UserCircle } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export const AvatarDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xl"
          className="cursor-pointer rounded-full"
        >
          <UserCircle className="text-body size-[24px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-border w-auto bg-white"
      >
        <DropdownMenuItem
          variant="default"
          className="cursor-pointer p-2.5"
          onClick={logout}
        >
          <LogOutIcon />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function Header() {
  return (
    <header className="border-border border-b-2 bg-white px-5 py-4">
      <div className="mx-auto flex w-full items-center justify-between">
        <div>
          <p className="text-xl tracking-[-0.03em] text-gray-950">
            Mesocycle Planner
          </p>
        </div>

        <AvatarDropdown />
      </div>
    </header>
  );
}

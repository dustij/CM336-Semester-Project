import { logout } from '@/app/(main)/actions';
import { LogOutIcon, UserCircle } from 'lucide-react';
import { buttonVariants } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const AVATAR_MENU_TRIGGER_ID = 'avatar-menu-trigger';
const AVATAR_MENU_CONTENT_ID = 'avatar-menu-content';

export const AvatarDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={AVATAR_MENU_TRIGGER_ID}
        className={buttonVariants({
          variant: 'ghost',
          size: 'icon-xl',
          className: 'cursor-pointer rounded-full',
        })}
      >
        <UserCircle className="text-body size-[24px]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        id={AVATAR_MENU_CONTENT_ID}
        aria-labelledby={AVATAR_MENU_TRIGGER_ID}
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

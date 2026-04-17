import { logout } from '@/app/(main)/actions';
import { LogOutIcon, User } from 'lucide-react';
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
          <User className="text-body size-[24px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-auto min-w-50 border-gray-200 bg-white"
      >
        {/* <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-base font-bold wrap-break-word text-gray-600">
                {userProfile?.fullName ?? "User"}
              </span>
              <span className="text-muted-foreground text-sm font-light break-all">
                {userProfile?.email ?? "No email"}
              </span>
            </div>
          </DropdownMenuLabel>

              <DropdownMenuItem>
                <BadgeCheckIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>

        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-gray-200" /> */}
        <DropdownMenuItem
          variant="default"
          className="cursor-pointer"
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
    <header className="border-b border-slate-200 bg-white px-5 py-4">
      <div className="mx-auto flex w-full items-center justify-between">
        <div>
          <p className="text-xl tracking-[-0.03em] text-slate-950">
            Mesocycle Planner
          </p>
        </div>

        <AvatarDropdown />
        {/* <form action={logout}>
          <Button type="submit" variant="ghost" className="cursor-pointer">
            <LogOut className="size-4" />
            Log Out
          </Button>
        </form> */}
      </div>
    </header>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { Dumbbell, FolderOpen, Timer, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavButtonProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isPending?: boolean;
  onNavigateStart?: (href: string) => void;
};

export function NavButton({
  href,
  icon: Icon,
  label,
  isActive = false,
  isPending = false,
  onNavigateStart,
}: NavButtonProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      aria-busy={isPending || undefined}
      onNavigate={() => {
        if (!isActive) {
          onNavigateStart?.(href);
        }
      }}
      className={cn(
        'text-body flex w-[75px] flex-col items-center justify-center gap-1.5 py-3 transition-colors',
        isActive && 'text-my-primary border-my-primary border-t-2'
      )}
    >
      <div className="relative">
        <Icon size={24} />
        {/* {isPending && (
          <span className="border-my-primary bg-my-background absolute -top-1 -right-1 size-2.5 rounded-full border-2" />
        )} */}
      </div>
      <p>{label}</p>
    </Link>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const isPending = (href: string) =>
    pendingHref === href && !pathname.startsWith(href);

  return (
    <nav className="border-border flex shrink-0 justify-between border-t bg-white px-5">
      <NavButton
        href="/current"
        icon={Timer}
        label="Current"
        isActive={pathname.startsWith('/current')}
        isPending={isPending('/current')}
        onNavigateStart={setPendingHref}
      />
      <NavButton
        href="/mesocycles"
        icon={FolderOpen}
        label="Mesocycles"
        isActive={pathname.startsWith('/mesocycles')}
        isPending={isPending('/mesocycles')}
        onNavigateStart={setPendingHref}
      />
      <NavButton
        href="/exercises"
        icon={Dumbbell}
        label="Exercises"
        isActive={pathname.startsWith('/exercises')}
        isPending={isPending('/exercises')}
        onNavigateStart={setPendingHref}
      />
    </nav>
  );
}

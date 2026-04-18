'use client';

import { cn } from '@/lib/utils';
import { Dumbbell, FolderOpen, Timer, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavButtonProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
};

export function NavButton({
  href,
  icon: Icon,
  label,
  isActive = false,
}: NavButtonProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'text-body flex w-[75px] flex-col items-center justify-center gap-1.5 py-3',
        isActive && 'text-my-primary border-my-primary border-t-2'
      )}
    >
      <div>
        <Icon size={24} />
      </div>
      <p>{label}</p>
    </Link>
  );
}

export default function Footer() {
  const pathname = usePathname();

  return (
    <nav className="border-border flex justify-between border-t bg-white px-5">
      <NavButton
        href="/current"
        icon={Timer}
        label="Current"
        isActive={pathname.startsWith('/current')}
      />
      <NavButton
        href="/mesocycles"
        icon={FolderOpen}
        label="Mesocycles"
        isActive={pathname.startsWith('/mesocycles')}
      />
      <NavButton
        href="/exercises"
        icon={Dumbbell}
        label="Exercises"
        isActive={pathname.startsWith('/exercises')}
      />
    </nav>
  );
}

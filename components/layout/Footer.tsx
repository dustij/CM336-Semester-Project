import { cn } from '@/lib/utils';

export default function Footer() {
  const isActive = true;
  return (
    <nav className="flex justify-between border-t bg-white px-5">
      <div
        className={cn(
          'py-2.5',
          isActive && 'text-my-primary border-my-primary border-t'
        )}
      >
        current
      </div>
      <div>mesocycles</div>
      <div>exercises</div>
    </nav>
  );
}

import { ExerciseListSkeleton } from '@/components/core/exercises/ExerciseListSkeleton';

export default function ExercisesLoading() {
  return (
    <main className="bg-my-background flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="bg-my-background shrink-0 px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="h-7 w-24 rounded-md bg-gray-200" />
          <div className="h-6 w-20 rounded-md bg-gray-200" />
        </div>
      </div>

      <ExerciseListSkeleton />
    </main>
  );
}

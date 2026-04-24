import { Button } from '@/components/ui/button';
import { getExerciseCatalog } from '@/db/repository/repository';
import { ListFilter } from 'lucide-react';

export default async function ExercisesPage() {
  const exercises = await getExerciseCatalog();

  return (
    <main className="bg-my-background flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="bg-my-background shrink-0 px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <p className="text-[18px] leading-7 font-semibold tracking-[-0.02em] text-gray-950">
            Exercises
          </p>
          <Button
            type="button"
            variant="ghost"
            className="h-auto gap-2 rounded-none p-0 text-[#667085] hover:bg-transparent active:translate-y-0"
          >
            <ListFilter className="size-5" />
            <span className="text-[16px] leading-6 font-medium">Filter</span>
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-[18px] pb-5">
        {exercises.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-xl font-medium text-gray-950">No Exercises Found</p>
            <p className="text-body">Exercises will appear here once available.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between gap-4 py-[2px]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] leading-6 font-semibold tracking-[-0.02em] text-[#475467]">
                    {exercise.name}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-5 font-medium text-[#98A2B3]">
                    {exercise.equipment}
                  </p>
                </div>

                <div className="bg-my-secondary shrink-0 rounded-[10px] px-[14px] py-[6px] text-[16px] leading-6 font-medium text-[#B42318]">
                  {exercise.muscleGroup}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

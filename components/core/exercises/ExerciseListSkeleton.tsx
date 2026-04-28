function ExerciseRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 py-[2px]">
      <div className="min-w-0 flex-1">
        <div className="h-6 w-3/4 rounded-md bg-gray-200" />
        <div className="mt-1.5 h-5 w-28 rounded-md bg-gray-200" />
      </div>

      <div className="h-9 w-28 shrink-0 rounded-[10px] bg-gray-200" />
    </div>
  );
}

export function ExerciseListSkeleton() {
  return (
    <div
      aria-label="Loading exercises"
      className="min-h-0 flex-1 overflow-hidden px-5 pt-[18px] pb-5"
    >
      <div className="flex animate-pulse flex-col gap-[10px]">
        {Array.from({ length: 10 }).map((_, index) => (
          <ExerciseRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

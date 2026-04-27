function MesocycleRowSkeleton() {
  return <div className="h-20 rounded-lg bg-gray-200" />;
}

export default function MesocyclesLoading() {
  return (
    <main
      aria-label="Loading mesocycles"
      className="bg-my-background flex flex-1 flex-col items-center justify-center"
    >
      <div className="flex w-full animate-pulse items-center px-5 py-3.5">
        <div className="flex-1">
          <div className="h-7 w-28 rounded-md bg-gray-200" />
        </div>
        <div className="h-9 w-20 rounded-lg bg-gray-200" />
      </div>
      <div className="w-full min-h-0 flex-1 overflow-hidden px-5 pt-2 pb-5">
        <div className="flex animate-pulse flex-col gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <MesocycleRowSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}

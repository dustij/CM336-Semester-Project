export default function CurrentLoading() {
  return (
    <main
      aria-label="Loading current mesocycle"
      className="bg-my-background flex min-h-0 flex-1 items-center justify-center overflow-hidden px-5 py-4"
    >
      <div className="flex w-full animate-pulse flex-col items-center justify-center gap-2">
        <div className="h-7 w-48 rounded-md bg-gray-200" />
        <div className="h-5 w-64 max-w-full rounded-md bg-gray-200" />
        <div className="my-4 h-9 w-36 rounded-lg bg-gray-200" />
      </div>
    </main>
  );
}

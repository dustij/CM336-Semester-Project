import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[393px] flex-col px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
            Mesocycle Planner
          </h1>
          <p className="mt-4 text-sm text-slate-600">
            This is a placeholder page for after login.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex text-sm font-medium text-slate-500 underline underline-offset-4"
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}

import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthPageShell({
  description,
  children,
}: {
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[393px] flex-col px-6 py-6">
        <Card className="flex flex-1 border-none py-0 shadow-none ring-0">
          <CardHeader className="px-0 pt-32">
            <CardTitle className="text-center text-[2rem] font-semibold tracking-[-0.03em] text-slate-950">
              Mesocycle Planner
            </CardTitle>
            <CardDescription className="pt-2 text-center text-[15px] text-slate-500">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col px-0">
            {children}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { verifySession } from '@/lib/session';
import { Suspense } from 'react';

function MainShell({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <main className="bg-background h-dvh overflow-hidden">
      <div className="bg-my-background mx-auto flex h-full w-full max-w-[393px] flex-col overflow-hidden">
        <Header />
        <div className="bg-my-background flex min-h-0 flex-1 overflow-hidden">
          {children}
        </div>
        <Footer />
      </div>
    </main>
  );
}

async function AuthenticatedMainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await verifySession();

  return <MainShell>{children}</MainShell>;
}

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<MainShell />}>
      <AuthenticatedMainLayout>{children}</AuthenticatedMainLayout>
    </Suspense>
  );
}

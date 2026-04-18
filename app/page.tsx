import { verifySession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function RedirectBySession() {
  await verifySession();
  redirect('/current');
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RedirectBySession />
    </Suspense>
  );
}

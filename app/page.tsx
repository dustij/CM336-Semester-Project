import { verifySession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { userId } = await verifySession();

  if (!userId) {
    redirect('/login');
  } else {
    redirect('/current');
  }
}

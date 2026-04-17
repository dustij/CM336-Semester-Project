import { getUser } from '@/lib/dal';
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  } else {
    redirect('/current');
  }
}

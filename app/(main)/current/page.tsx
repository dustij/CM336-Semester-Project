import CurrentPage from '@/components/main/CurrentPage';
import { verifySession } from '@/lib/session';

export default async function Current() {
  const { userId } = await verifySession();

  return <CurrentPage userId={userId} />;
}

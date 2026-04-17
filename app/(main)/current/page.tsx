import CurrentPage from '@/components/main/CurrentPage';
import { verifySession } from '@/lib/dal';

export default async function Current() {
  await verifySession();

  return <CurrentPage />;
}

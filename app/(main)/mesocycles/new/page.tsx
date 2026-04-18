import NewMesocyclePage from '@/components/main/NewMesocyclePage';
import { verifySession } from '@/lib/session';

export default async function New() {
  const { userId } = await verifySession();
  return <NewMesocyclePage />;
}

import MesocyclesPage from '@/components/core/MesocyclesPage';
import { verifySession } from '@/lib/session';

export default async function Mesocycles() {
  const { userId } = await verifySession();
  return <MesocyclesPage userId={userId} />;
}

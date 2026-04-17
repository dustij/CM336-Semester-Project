import MesocyclesPage from '@/components/main/MesocyclesPage';
import { verifySession } from '@/lib/session';

export default async function Mesocycles() {
  await verifySession();
  return <MesocyclesPage />;
}

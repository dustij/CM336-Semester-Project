import MesocyclesPage from '@/components/main/MesocyclesPage';
import { verifySession } from '@/lib/dal';

export default async function Mesocycles() {
  await verifySession();
  return <MesocyclesPage />;
}

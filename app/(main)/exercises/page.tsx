import ExercisesPage from '@/components/main/ExercisesPage';
import { verifySession } from '@/lib/dal';

export default async function Exercises() {
  await verifySession();
  return <ExercisesPage />;
}

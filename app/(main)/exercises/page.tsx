import ExercisesPage from '@/components/core/ExercisesPage';
import { verifySession } from '@/lib/session';

export default async function Exercises() {
  await verifySession();
  return <ExercisesPage />;
}

import { redirectFromHomePage } from '@/lib/auth/session';

export default async function Page() {
  await redirectFromHomePage();
}

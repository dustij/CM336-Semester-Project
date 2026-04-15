import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const AUTH_SESSION_COOKIE = 'cm336-auth-session';

export async function getAuthenticatedEmail() {
  const sessionCookie = (await cookies()).get(AUTH_SESSION_COOKIE)?.value?.trim();

  return sessionCookie || null;
}

export async function isAuthenticated() {
  return (await getAuthenticatedEmail()) !== null;
}

export async function redirectFromHomePage() {
  if (await isAuthenticated()) {
    redirect('/current');
  }

  redirect('/login');
}

export async function requireAuthentication() {
  if (!(await isAuthenticated())) {
    redirect('/login');
  }
}

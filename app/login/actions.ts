'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AUTH_SESSION_COOKIE } from '@/lib/auth/session';

export type LoginState = {
  error?: string;
};

export type AuthUserRecord = {
  id: number | string;
  email: string;
  display_name: string;
};

async function findUserByCredentials(input: {
  email: string;
  password: string;
}): Promise<AuthUserRecord | null> {
  const { email, password } = input;

  if (!email || !password) {
    return null;
  }

  // TODO: Replace this placeholder with a MySQL-backed lookup.
  // Expected backend contract:
  // 1. Accept the submitted email and password.
  // 2. Call a MySQL function/query that checks whether the email and hashed
  //    password match an existing user.
  // 3. Return the matching user record when credentials are valid.
  // 4. Return null when no user matches.
  return {
    id: email,
    email,
    display_name: 'User',
  };
}

export async function loginAuth(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
  const password = formData.get('password')?.toString().trim() ?? '';

  if (!email || !password) {
    return {
      error: 'Email and password are required.',
    };
  }

  const user = await findUserByCredentials({ email, password });

  if (!user) {
    return {
      error: 'Invalid email or password.',
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(AUTH_SESSION_COOKIE, user.email, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  redirect('/');
}

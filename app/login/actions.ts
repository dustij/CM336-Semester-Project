'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AUTH_SESSION_COOKIE } from '@/lib/auth/session';
import { LoginFormSchema, type LoginFormState } from '@/lib/definitions';

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
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
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

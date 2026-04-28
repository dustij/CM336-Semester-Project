'use server';

import { getUserCredentialsByEmail } from '@/db/repository/users_repository';
import { LoginFormSchema, LoginFormState } from '@/lib/core/form-definitions';
import { createSession } from '@/lib/session';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import * as z from 'zod';

export async function login(
  _state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  let user;
  try {
    user = await getUserCredentialsByEmail(email);
  } catch (error) {
    console.error('Failed to fetch user account for login.', error);

    return {
      message: 'An error occurred while logging in.',
    };
  }

  if (!user) {
    return {
      message: 'Invalid email or password.',
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return {
      message: 'Invalid email or password.',
    };
  }

  await createSession(user.id);
  redirect('/');
}

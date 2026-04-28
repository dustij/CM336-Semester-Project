'use server';

import { createUser } from '@/db/repository/users_repository';
import bcrypt from 'bcrypt';
import * as z from 'zod';

import { FormState, SignupFormSchema } from '@/lib/core/form-definitions';
import { createSession } from '@/lib/session';
import { redirect } from 'next/navigation';

type MySqlError = {
  code?: string;
};

function isDuplicateEntryError(error: unknown): error is MySqlError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ER_DUP_ENTRY'
  );
}

export async function signup(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  // 2. Prepare data for insertion into database
  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insert the user into the database
  let userId: number;
  try {
    userId = await createUser({ email, name, passwordHash: hashedPassword });
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      return {
        errors: {
          email: ['An account with this email already exists.'],
        },
      };
    }

    console.error('Failed to create user account.', error);

    return {
      message: 'An error occurred while creating your account.',
    };
  }

  // 4. Create user session
  await createSession(userId);

  // 5. Redirect user
  redirect('/');
}

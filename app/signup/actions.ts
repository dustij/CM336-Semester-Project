'use server';

import * as db from '@/db/db';
import { queries } from '@/db/sql';
import bcrypt from 'bcrypt';
import * as z from 'zod';

import { FormState, SignupFormSchema } from '@/lib/core/form-definitions';
import { createSession } from '@/lib/session';
import { QueryResult, ResultSetHeader } from 'mysql2';
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
  // e.g. Hash the user's password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insert the user into the database
  // INSERT INTO users (email, display_name, password_hash)
  // VALUES (?, ?, ?)
  let result: QueryResult;
  try {
    result = await db.query(queries.insertUser, [email, name, hashedPassword]);
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
  const userId = (result as ResultSetHeader).insertId;
  await createSession(userId);

  // 5. Redirect user
  redirect('/');
}

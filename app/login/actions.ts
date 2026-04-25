'use server';

import * as db from '@/db/server/db';
import { selectUserCredentialsByEmail } from '@/db/sql/ts/users/query';
import { LoginFormSchema, LoginFormState } from '@/lib/core/form-definitions';
import { createSession } from '@/lib/session';
import bcrypt from 'bcrypt';
import { QueryResult, RowDataPacket } from 'mysql2';
import { redirect } from 'next/navigation';
import * as z from 'zod';

type UserLoginRow = RowDataPacket & {
  id: number;
  password_hash: string;
};

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

  let result: QueryResult;
  try {
    result = await db.query(selectUserCredentialsByEmail, [email]);
  } catch (error) {
    console.error('Failed to fetch user account for login.', error);

    return {
      message: 'An error occurred while logging in.',
    };
  }

  const [user] = result as UserLoginRow[];

  if (!user) {
    return {
      message: 'Invalid email or password.',
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return {
      message: 'Invalid email or password.',
    };
  }

  await createSession(user.id);
  redirect('/');
}

import 'server-only';

import * as db from '@/db/db';
import { queries } from '@/db/sql';
import type { User } from '@/lib/definitions';
import { decrypt } from '@/lib/session';
import { QueryResult, RowDataPacket } from 'mysql2';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect('/login');
  }

  return { isAuth: true, userId: session.userId };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  type UserRow = RowDataPacket & {
    id: number;
    email: string;
    display_name: string;
  };

  let result: QueryResult;
  try {
    result = await db.query(queries.selectUserById, [session.userId as number]);
  } catch (error) {
    console.error('Failed to fetch user.', error);
    return null;
  }

  const [user] = result as UserRow[];

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.display_name,
  } satisfies User;
});

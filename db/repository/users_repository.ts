import 'server-only';

import * as db from '@/db/server/db';
import {
  insertUser,
  selectUserCredentialsByEmail,
} from '@/db/sql/ts/users/query';
import type { QueryResult, ResultSetHeader, RowDataPacket } from 'mysql2';

type UserCredentialsRow = RowDataPacket & {
  id: number;
  password_hash: string;
};

export type UserCredentials = {
  id: number;
  passwordHash: string;
};

export async function getUserCredentialsByEmail(
  email: string
): Promise<UserCredentials | null> {
  const result = (await db.query(selectUserCredentialsByEmail, [
    email,
  ])) as UserCredentialsRow[];
  const [user] = result;

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    passwordHash: user.password_hash,
  };
}

export async function createUser({
  email,
  name,
  passwordHash,
}: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<number> {
  const result = (await db.query(insertUser, [
    email,
    name,
    passwordHash,
  ])) as QueryResult;

  return (result as ResultSetHeader).insertId;
}

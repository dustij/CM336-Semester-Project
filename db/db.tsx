import 'server-only';

import mysql from 'mysql2/promise';

type SqlSafeValue =
  | string
  | number
  | bigint
  | boolean
  | Date
  | Buffer
  | Uint8Array
  | SqlSafeValue[]
  | null;

async function getConnection() {
  return await mysql.createConnection(process.env['MYSQL_URI'] ?? '');
}

export async function query(sql: string, values: SqlSafeValue[] = []) {
  const conn = await getConnection();
  const [result] = await conn.execute(sql, values);
  return result;
}

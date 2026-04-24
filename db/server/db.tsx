import 'server-only';

import type { ConnectionOptions, SslOptions } from 'mysql2';
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

const SSL_MODE_QUERY_KEYS = ['ssl-mode', 'ssl_mode'] as const;

function getSslOptions(sslMode: string): SslOptions | undefined {
  switch (sslMode.toUpperCase()) {
    case 'DISABLED':
      return undefined;
    case 'REQUIRED':
      return { rejectUnauthorized: false };
    case 'VERIFY_CA':
      return {};
    case 'VERIFY_IDENTITY':
      return { verifyIdentity: true };
    default:
      throw new Error(`Unsupported MYSQL_URI ssl-mode: ${sslMode}`);
  }
}

function getConnectionConfig(): ConnectionOptions {
  const uri = process.env['MYSQL_URI'];
  if (!uri) {
    throw new Error('MYSQL_URI is not set');
  }

  const parsedUri = new URL(uri);
  let sslMode: string | null = null;

  for (const key of SSL_MODE_QUERY_KEYS) {
    const value = parsedUri.searchParams.get(key);
    if (value !== null) {
      sslMode ??= value;
      parsedUri.searchParams.delete(key);
    }
  }

  const connectionOptions: ConnectionOptions = { uri: parsedUri.toString() };

  if (sslMode !== null) {
    connectionOptions.ssl = getSslOptions(sslMode);
  }

  return connectionOptions;
}

async function getConnection() {
  return await mysql.createConnection(getConnectionConfig());
}

export async function query(sql: string, values: SqlSafeValue[] = []) {
  const conn = await getConnection();
  try {
    const [result] = await conn.execute(sql, values);
    return result;
  } finally {
    await conn.end();
  }
}

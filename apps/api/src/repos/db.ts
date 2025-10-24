import { Pool, QueryResult, QueryResultRow } from "pg";

import dotenv from "dotenv";
dotenv.config();

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set. Set it to use the database.");
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const client = getDbPool();
  return client.query<T>(text, params);
}



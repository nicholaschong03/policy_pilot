import { query } from "./db";
import type { UserRole, UserRecord, PublicUser } from "../types/auth";

export async function ensureUserSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('agent','admin')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const { rows } = await query<{ id: string; email: string; password_hash: string; role: UserRole }>(
    "SELECT id, email, password_hash, role FROM users WHERE email=$1",
    [email]
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return { id: r.id, email: r.email, passwordHash: r.password_hash, role: r.role };
}

export async function insertUser(u: { id: string; email: string; passwordHash: string; role: UserRole }): Promise<PublicUser> {
  await query(
    "INSERT INTO users (id, email, password_hash, role) VALUES ($1,$2,$3,$4)",
    [u.id, u.email, u.passwordHash, u.role]
  );
  return { id: u.id, email: u.email, role: u.role };
}

export async function getPublicUserById(id: string): Promise<PublicUser | null> {
  const { rows } = await query<{ id: string; email: string; role: UserRole }>(
    "SELECT id, email, role FROM users WHERE id=$1",
    [id]
  );
  return rows[0] ?? null;
}



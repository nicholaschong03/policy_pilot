import { query } from "./db";
import type { UserRole, UserRecord, PublicUser, UserListItem } from "../types/auth";

export async function ensureUserSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('agent','admin')),
      full_name TEXT,
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

export async function insertUser(u: { id: string; email: string; passwordHash: string; role: UserRole; full_name?: string }): Promise<PublicUser> {
  await query(
    "INSERT INTO users (id, email, password_hash, role, full_name) VALUES ($1,$2,$3,$4,$5)",
    [u.id, u.email, u.passwordHash, u.role, u.full_name ?? null]
  );
  return { id: u.id, email: u.email, role: u.role, full_name: u.full_name };
}

export async function getPublicUserById(id: string): Promise<PublicUser | null> {
  const { rows } = await query<{ id: string; email: string; role: UserRole; full_name: string | null }>(
    "SELECT id, email, role, full_name FROM users WHERE id=$1",
    [id]
  );
  const r = rows[0];
  return r ? { id: r.id, email: r.email, role: r.role, full_name: r.full_name ?? undefined } : null;
}

export async function listUsersByRole(role: UserRole): Promise<UserListItem[]> {
  const { rows } = await query<{
    id: string;
    email: string;
    role: UserRole;
    full_name: string | null;
    created_at: string;
  }>(
    "SELECT id, email, role, full_name, created_at FROM users WHERE role=$1 ORDER BY created_at DESC",
    [role]
  );
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role,
    full_name: r.full_name ?? undefined,
    created_at: r.created_at,
  }));
}

export async function deleteUserById(id: string): Promise<void> {
  await query("DELETE FROM users WHERE id=$1", [id]);
}

export async function countUsersByRole(role: UserRole): Promise<number> {
  const { rows } = await query<{ count: number }>(
    "SELECT COUNT(*)::int as count FROM users WHERE role=$1",
    [role]
  );
  return rows[0]?.count ?? 0;
}



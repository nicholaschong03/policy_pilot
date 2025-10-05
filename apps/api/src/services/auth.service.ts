import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { USE_DB, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } from "../config/env";
import { ensureUserSchema, findUserByEmail, insertUser, getPublicUserById } from "../repos/users.repo.db";
import { listUsersByRole } from "../repos/users.repo.db";
import type { UserRole, UserRecord, PublicUser, UserListItem } from "../types/auth";

export type { UserRole, UserRecord, PublicUser };

// In DB mode, we no longer use in-memory maps. Kept for fallback only (if no DB).
const usersById = new Map<string, UserRecord>();
const usersByEmail = new Map<string, UserRecord>();

// Token revocation via JWT ID (jti)
const revokedTokenIds = new Set<string>();

// Helper functions

function getJwtSecret(): string {
  return process.env.JWT_SECRET || "dev-insecure-secret";
}

export function sanitizeUser(user: UserRecord): PublicUser {
  return { id: user.id, email: user.email, role: user.role, full_name: user.full_name };
}

export function userStoreIsEmpty(): boolean {
  return usersById.size === 0;
}

//Services
export async function createUser(args: { email: string; passwordHash: string; role: UserRole; fullName?: string }): Promise<PublicUser> {
  const email = args.email.toLowerCase();
  // Try DB first
  if (USE_DB) {
    await ensureUserSchema();
    const existing = await findUserByEmail(email);
    if (existing) throw new Error("User already exists");
    const id = crypto.randomUUID();
    return await insertUser({ id, email, passwordHash: args.passwordHash, role: args.role, full_name: args.fullName });
  }
  // Fallback to in-memory
  const existing = usersByEmail.get(email);
  if (existing) throw new Error("User already exists");
  const id = crypto.randomUUID();
  const rec: UserRecord = { id, email, passwordHash: args.passwordHash, role: args.role, full_name: args.fullName };
  usersById.set(id, rec);
  usersByEmail.set(email, rec);
  return sanitizeUser(rec);
}

export async function verifyCredentials(email: string, password: string): Promise<UserRecord | null> {
  const emailLc = email.toLowerCase();
  if (USE_DB) {
    await ensureUserSchema();
    const rec = await findUserByEmail(emailLc);
    if (!rec) return null;
    const ok = await bcrypt.compare(password, rec.passwordHash);
    if (!ok) return null;
    return rec;
  }
  const rec = usersByEmail.get(emailLc);
  if (!rec) return null;
  const ok = await bcrypt.compare(password, rec.passwordHash);
  if (!ok) return null;
  return rec;
}

export function getUserById(id: string): PublicUser | null {
  const rec = usersById.get(id);
  return rec ? sanitizeUser(rec) : null;
}

export async function getUserByIdAsync(id: string): Promise<PublicUser | null> {
  if (!USE_DB) return getUserById(id);
  await ensureUserSchema();
  return await getPublicUserById(id);
}

export function issueTokens(user: PublicUser): {access_token: string, role: UserRole, tokenId: string} {
    const tokenId = crypto.randomUUID();
    const access_token = jwt.sign({sub: user.id, role: user.role},
         getJwtSecret(),
          {expiresIn: "12h", jwtid: tokenId});
    return {access_token, role: user.role, tokenId};
}

export function revokeToken(tokenId: string): void {
  revokedTokenIds.add(tokenId);
}

export function isTokenRevoked(tokenId: string | undefined): boolean {
  if (!tokenId) return true;
  return revokedTokenIds.has(tokenId);
}

// DB helpers
export async function initAuth(): Promise<void> {
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) return;
  if (!USE_DB) {
    // In-memory seed for dev fallback
    if (userStoreIsEmpty()) {
      const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);
      try {
        await createUser({ email: SEED_ADMIN_EMAIL, passwordHash, role: "admin" });
        // eslint-disable-next-line no-console
        console.log("Seeded admin user (memory)", SEED_ADMIN_EMAIL);
      } catch {}
    }
    return;
  }
  await ensureUserSchema();
  const existing = await findUserByEmail(SEED_ADMIN_EMAIL.toLowerCase());
  if (existing) return;
  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);
  await createUser({ email: SEED_ADMIN_EMAIL, passwordHash, role: "admin" });
  // eslint-disable-next-line no-console
  console.log("Seeded admin user (db)", SEED_ADMIN_EMAIL);
}

export async function listAgents(): Promise<UserListItem[]> {
  if (USE_DB) {
    await ensureUserSchema();
    return await listUsersByRole("agent");
  }
  // Fallback to in-memory store
  const items: UserListItem[] = [];
  for (const user of usersById.values()) {
    if (user.role === "agent") {
      items.push({ id: user.id, email: user.email, role: user.role, full_name: user.full_name });
    }
  }
  // Most recently created first is not tracked in memory; return as-is
  return items;
}


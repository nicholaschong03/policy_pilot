export type UserRole = "agent" | "admin";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
}



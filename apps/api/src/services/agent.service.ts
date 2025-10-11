import { ensureUserSchema } from "../repos/users.repo.db";
import { UserListItem } from "../types/auth";
import { USE_DB } from "../config/env";
import { listUsersByRole, countUsersByRole } from "../repos/users.repo.db";
import { UserRecord } from "../types/auth";
import type { PublicUser } from "../types/auth";


const usersById = new Map<string, UserRecord>();
const usersByEmail = new Map<string, UserRecord>();

export type { PublicUser };


export async function listAgents(): Promise<UserListItem[]> {
    if (USE_DB) {
        await ensureUserSchema();
        return await listUsersByRole("agent");
    }

    const items: UserListItem[] = [];
    for (const user of usersById.values()) {
        if (user.role === "agent") {
            items.push({ id: user.id, email: user.email, role: user.role, full_name: user.full_name });
        }
    }
    return items;
}

export async function deleteUser(id: string): Promise<void> {
    if (USE_DB) {
        await ensureUserSchema();
        const { deleteUserById } = await import("../repos/users.repo.db");
        await deleteUserById(id);
        return;
    }
    const existing = usersById.get(id);
    if (!existing) return;
    usersById.delete(id);
    usersByEmail.delete(existing.email.toLowerCase());
}

export async function countAgents(): Promise<number> {
    if (USE_DB) {
        await ensureUserSchema();
        return await countUsersByRole("agent");
    }
    let count = 0;
    for (const user of usersById.values()) {
        if (user.role === "agent") count++;
    }
    return count;
}
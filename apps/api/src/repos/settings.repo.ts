import { query } from "./db";

export type SlaConfig = {
    High: { first_response_minutes: number; resolution_hours: number; escalation_hours: number };
    Medium: { first_response_minutes: number; resolution_hours: number; escalation_hours: number };
    Low: { first_response_minutes: number; resolution_hours: number; escalation_hours: number };
};

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
    const { rows } = await query<{ value: any }>(
        `SELECT value FROM app_settings WHERE key=$1`,
        [key]
    );
    if (rows.length === 0) return null;
    return rows[0].value as T;
}

export async function setSetting<T = unknown>(key: string, value: T): Promise<void> {
    await query(
        `INSERT INTO app_settings(key, value, updated_at)
       VALUES ($1,$2,now())
       ON CONFLICT (key)
       DO UPDATE SET value=EXCLUDED.value, updated_at=now()`,
        [key, JSON.stringify(value)]
    );
}



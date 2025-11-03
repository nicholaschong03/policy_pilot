import { query } from "../repos/db";

export type TargetRole = "agent" | "admin";

async function findStickyAssigneeByEmail(email: string, role: TargetRole): Promise<string | null> {
  if (!email) return null;
  const { rows } = await query<{ assigned_to: string }>(
    `SELECT t.assigned_to
       FROM tickets t
       JOIN users u ON u.id::text = t.assigned_to
      WHERE t.email = $1
        AND t.assigned_to IS NOT NULL
        AND u.role = $2
      ORDER BY t.created_at DESC
      LIMIT 1`,
    [email.toLowerCase(), role]
  );
  return rows?.[0]?.assigned_to ?? null;
}

async function findLeastLoadedAssignee(role: TargetRole): Promise<string | null> {
  const { rows } = await query<{ id: string }>(
    `SELECT u.id
       FROM users u
  LEFT JOIN tickets t
         ON t.assigned_to IS NOT NULL AND u.id::text = t.assigned_to
        AND t.status = 'active'
        AND t.resolved_at IS NULL
      WHERE u.role = $1
      GROUP BY u.id
      ORDER BY
        COALESCE(SUM(CASE t.priority WHEN 'High' THEN 3 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 1 ELSE 1 END), 0) ASC,
        COUNT(t.id) ASC,
        random()
      LIMIT 1`,
    [role]
  );
  return rows?.[0]?.id ?? null;
}

export async function chooseAssigneeForTicket(email: string | null | undefined, role: TargetRole): Promise<string | null> {
  // 1) sticky routing if possible
  if (email) {
    const sticky = await findStickyAssigneeByEmail(email, role);
    if (sticky) return sticky;
  }
  // 2) least loaded fallback
  return await findLeastLoadedAssignee(role);
}



import { query } from "../repos/db";

import dotenv from "dotenv";
dotenv.config();

async function markBreachesOnce(): Promise<void> {
    // First response breach: active tickets with due passed and no first_response_sent_at
    await query(
        `UPDATE tickets
        SET status = 'breached_first_response', updated_at = now()
      WHERE status IN ('untriaged','active')
        AND first_response_due IS NOT NULL
        AND first_response_sent_at IS NULL
        AND first_response_due < now()`
    );

    // Resolution breach: tickets not resolved and resolution due passed
    await query(
        `UPDATE tickets
        SET status = 'breached_resolution', updated_at = now()
      WHERE status IN ('active','escalated','breached_first_response')
        AND resolution_due IS NOT NULL
        AND resolved_at IS NULL
        AND resolution_due < now()`
    );
}

async function main() {
    console.log("SLA worker starting...");
    // Run immediately, then every minute
    await markBreachesOnce();
    setInterval(() => {
        markBreachesOnce().catch((e) => console.error("SLA worker tick failed:", e?.message || e));
    }, 60_000);
}

main().catch((e) => {
    console.error("SLA worker failed to start:", e?.message || e);
    process.exit(1);
});



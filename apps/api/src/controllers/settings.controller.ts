import { Request, Response } from "express";
import { z } from "zod";
import { getSlaConfig, setSlaConfig } from "../services/sla.service";

const SlaSchema = z.object({
    High: z.object({ first_response_minutes: z.number().int().positive(), resolution_hours: z.number().int().positive(), escalation_hours: z.number().int().positive() }),
    Medium: z.object({ first_response_minutes: z.number().int().positive(), resolution_hours: z.number().int().positive(), escalation_hours: z.number().int().positive() }),
    Low: z.object({ first_response_minutes: z.number().int().positive(), resolution_hours: z.number().int().positive(), escalation_hours: z.number().int().positive() }),
});

export async function getSla(req: Request, res: Response) {
    const cfg = await getSlaConfig();
    return res.json(cfg);
}

export async function putSla(req: Request, res: Response) {
    const parsed = SlaSchema.safeParse(req.body || {});
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid SLA config", details: parsed.error.flatten() });
    }
    await setSlaConfig(parsed.data);
    return res.json({ ok: true });
}



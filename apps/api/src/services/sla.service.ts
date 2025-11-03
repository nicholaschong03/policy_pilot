import { getSetting, setSetting, type SlaConfig } from "../repos/settings.repo";

const DEFAULT_SLA: SlaConfig = {
    High: { first_response_minutes: 60, resolution_hours: 24, escalation_hours: 2 },
    Medium: { first_response_minutes: 240, resolution_hours: 72, escalation_hours: 8 },
    Low: { first_response_minutes: 1440, resolution_hours: 168, escalation_hours: 24 },
};

export async function getSlaConfig(): Promise<SlaConfig> {
    const cfg = await getSetting<SlaConfig>("sla");
    return cfg ?? DEFAULT_SLA;
}

export async function setSlaConfig(cfg: SlaConfig): Promise<void> {
    await setSetting("sla", cfg);
}

export function computeDueDates(
    createdAtIso: string,
    priority: "High" | "Medium" | "Low",
    cfg: SlaConfig
) {
    const created = new Date(createdAtIso);
    const p = cfg[priority];
    const first = new Date(created.getTime() + p.first_response_minutes * 60 * 1000);
    const resolution = new Date(created.getTime() + p.resolution_hours * 60 * 60 * 1000);
    const escalation = new Date(created.getTime() + p.escalation_hours * 60 * 60 * 1000);
    return {
        first_response_due: first.toISOString(),
        resolution_due: resolution.toISOString(),
        escalation_due: escalation.toISOString(),
    };
}



import { Request, Response } from "express";
import { PublicUser } from "../services/agent.service";
import { listAgents, deleteUser, countAgents } from "../services/agent.service";
import { listActiveTeamTickets, listTicketsAssignedToUser } from "../repos/tickets.repo";

type AuthedRequest = Request & { user?: PublicUser; tokenId?: string };


export async function getAgents(_req: AuthedRequest, res: Response) {
    try {
        const agents = await listAgents();
        return res.json({ agents });
    } catch (err: any) {
        return res.status(500).json({ error: err?.message || "Failed to list agents" });
    }
}

export async function deleteAgent(req: AuthedRequest, res: Response) {
    try {
        const { id } = req.params as { id: string };
        if (!id) return res.status(400).json({ error: "Missing agent id" });
        await deleteUser(id);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(500).json({ error: err?.message || "Failed to delete agent" });
    }
}

export async function getAgentsCount(_req: AuthedRequest, res: Response) {
    try {
        const count = await countAgents();
        return res.json({ count });
    } catch (err: any) {
        return res.status(500).json({ error: err?.message || "Failed to count agents" });
    }
}

export async function listMyTickets(req: AuthedRequest, res: Response) {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        const items = await listTicketsAssignedToUser(req.user.id);
        return res.json({ tickets: items });
    } catch (err: any) {
        return res.status(500).json({ error: err?.message || "Failed to list tickets" });
    }
}

export async function listTeamTickets(_req: AuthedRequest, res: Response) {
    try {
        const items = await listActiveTeamTickets();
        return res.json({ tickets: items });
    } catch (err: any) {
        return res.status(500).json({ error: err?.message || "Failed to list team tickets" });
    }
}


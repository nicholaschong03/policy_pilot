import {Request, Response} from "express";
import {  PublicUser } from "../services/agent.service";
import { listAgents, deleteUser, countAgents } from "../services/agent.service";

type AuthedRequest = Request & { user?: PublicUser; tokenId?: string };


export async function getAgents(_req: AuthedRequest, res: Response) {
    try{
        const agents = await listAgents();
        return res.json({agents});
    } catch (err: any) {
        return res.status(500).json({error: err?.message || "Failed to list agents"});
    }
}

export async function deleteAgent(req: AuthedRequest, res: Response){
    try{
        const {id} = req.params as {id: string};
        if(!id) return res.status(400).json({error: "Missing agent id"});
        await deleteUser(id);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(500).json({error: err?.message || "Failed to delete agent"});
    }
}

export async function getAgentsCount(_req: AuthedRequest, res: Response){
    try{
        const count = await countAgents();
        return res.json({ count });
    } catch (err: any) {
        return res.status(500).json({error: err?.message || "Failed to count agents"});
    }
}


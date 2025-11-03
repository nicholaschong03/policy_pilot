import { Router } from "express";
import { getAgents, deleteAgent, getAgentsCount, listMyTickets, listTeamTickets } from "../controllers/agent.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth(), requireRole("admin"), getAgents);
router.get("/count", requireAuth(), requireRole("admin"), getAgentsCount);
router.delete("/:id", requireAuth(), requireRole("admin"), deleteAgent);
router.get("/tickets/my", requireAuth(), listMyTickets);
router.get("/tickets/team", requireAuth(), requireRole(["admin", "agent"]), listTeamTickets);

export default router;
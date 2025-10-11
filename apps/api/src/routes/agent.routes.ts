import { Router } from "express";
import { getAgents, deleteAgent, getAgentsCount } from "../controllers/agent.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth(), requireRole("admin"), getAgents);
router.get("/count", requireAuth(), requireRole("admin"), getAgentsCount);
router.delete("/:id", requireAuth(), requireRole("admin"), deleteAgent);

export default router;
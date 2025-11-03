import { Router } from "express";
import { createTicket, postTriage, listTickets, getTicketByEmail, countActiveTickets, getAdminTicketStats, getAdminAnalytics, assignTicket, getTicketForStaff, resolveTicket, recordFirstResponse } from "../controllers/tickets.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.post("/triage", postTriage);
router.post("/", createTicket);
router.get("/by-email", listTickets);
router.get("/admin/count/active", requireAuth(), requireRole("admin"), countActiveTickets);
router.get("/admin/stats", requireAuth(), requireRole("admin"), getAdminTicketStats);
router.get("/admin/analytics", requireAuth(), requireRole("admin"), getAdminAnalytics);
router.patch("/:id/assign", requireAuth(), requireRole(["admin", "agent"]), assignTicket);
router.get("/staff/:id", requireAuth(), requireRole(["admin", "agent"]), getTicketForStaff);
router.patch("/:id/resolve", requireAuth(), requireRole(["admin", "agent"]), resolveTicket);
router.patch("/:id/first-response", requireAuth(), requireRole(["admin", "agent"]), recordFirstResponse);
router.get("/:id", getTicketByEmail);

export default router;



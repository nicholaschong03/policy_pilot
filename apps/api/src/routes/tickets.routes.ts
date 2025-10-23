import { Router } from "express";
import { createTicket, postTriage } from "../controllers/tickets.controller";

const router = Router();

router.post("/triage", postTriage);
router.post("/", createTicket);

export default router;



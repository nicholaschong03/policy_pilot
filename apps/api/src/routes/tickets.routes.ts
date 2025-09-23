import { Router } from "express";
import { postTriage } from "../controllers/tickets.controller";

const router = Router();

router.post("/triage", postTriage);

export default router;



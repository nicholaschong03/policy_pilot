import { Router } from "express";
import { getSla, putSla } from "../controllers/settings.controller";

const router = Router();

router.get("/sla", getSla);
router.put("/sla", putSla);

export default router;



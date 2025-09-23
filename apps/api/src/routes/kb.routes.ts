import { Router } from "express";
import { getSearch } from "../controllers/kb.controller";

const router = Router();

router.get("/search", getSearch);

export default router;



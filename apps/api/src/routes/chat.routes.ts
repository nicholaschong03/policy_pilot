import { Router } from "express";
import { postChat, previewRetrieval } from "../controllers/chat.controller";

const router = Router();

router.post("/", postChat);
router.get("/preview", previewRetrieval);

export default router;



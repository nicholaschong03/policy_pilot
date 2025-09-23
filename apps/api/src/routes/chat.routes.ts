import { Router } from "express";
import { postChat } from "../controllers/chat.controller";

const router = Router();

router.post("/", postChat);

export default router;



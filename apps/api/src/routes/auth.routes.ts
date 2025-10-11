import { Router } from "express";
import { getMe, postLogin, postLogout, postRegister } from "../controllers/auth.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Admin-only register endpoint (optional in MVP)
router.post("/register", requireAuth(), requireRole("admin"), postRegister);

// Public login
router.post("/login", postLogin);

// Profile
router.get("/me", requireAuth(), getMe);

// Optional logout (token revocation)
router.post("/logout", requireAuth(), postLogout);

export default router;



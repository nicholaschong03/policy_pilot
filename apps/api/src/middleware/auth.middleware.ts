import { Request, Response, NextFunction } from "express";
import { isTokenRevoked, getUserByIdAsync, UserRole } from "../services/auth.service";
import { verifyJwt } from "../utils/jwt";
import type { PublicUser } from "../types/auth";

type AuthedRequest = Request & { user?: PublicUser; tokenId?: string };

export function requireAuth() {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization || "";
    const [, token] = header.split(" ");
    if (!token) return res.status(401).json({ error: "Missing token" });
    try {
      const payload = verifyJwt<import("jsonwebtoken").JwtPayload>(token);
      const tokenId = (payload as any).jti as string | undefined;
      if (isTokenRevoked(tokenId)) return res.status(401).json({ error: "Token revoked" });
      const userId = payload.sub as string;
      const user = await getUserByIdAsync(userId);
      if (!user) return res.status(401).json({ error: "User not found" });
      req.user = user;
      req.tokenId = tokenId;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

export function requireRole(role: UserRole | UserRole[]) {
  const allowed = Array.isArray(role) ? role : [role];
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!allowed.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}



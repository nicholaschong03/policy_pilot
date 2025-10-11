import { Request, Response } from "express";
import { createUser, issueTokens, sanitizeUser, verifyCredentials, PublicUser, revokeToken, listAgents } from "../services/auth.service";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { hashPassword } from "../utils/password";

import { deleteUser } from "../services/auth.service";

type AuthedRequest = Request & { user?: PublicUser; tokenId?: string };

export async function postRegister(req: Request, res: Response) {
  try {
    const { email, password, role, fullName } = registerSchema.parse(req.body);
    const passwordHash = await hashPassword(password);
    const user = await createUser({ email, passwordHash, role, fullName });
    return res.status(201).json(user);
  } catch (err: any) {
    if (err?.message === "User already exists") {
      return res.status(409).json({ error: "User already exists" });
    }
    return res.status(400).json({ error: err?.message ?? "Bad request" });
  }
}

export async function postLogin(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const userRec = await verifyCredentials(email, password);
    if (!userRec) return res.status(401).json({ error: "Invalid credentials" });
    const publicUser: PublicUser = sanitizeUser(userRec);
    const { access_token, role } = issueTokens(publicUser);
    return res.json({ access_token, role });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Bad request" });
  }
}

export async function getMe(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  return res.json(req.user);
}

export async function postLogout(req: AuthedRequest, res: Response) {
  const tokenId = req.tokenId;
  if (tokenId) revokeToken(tokenId);
  return res.status(204).send();
}




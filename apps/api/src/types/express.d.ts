import type { PublicUser } from "../services/auth.service";

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
      tokenId?: string;
    }
  }
}

export {};



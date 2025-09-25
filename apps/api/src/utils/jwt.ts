import jwt from "jsonwebtoken";

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || "dev-insecure-secret";
}

export function signJwt(payload: object, options?: jwt.SignOptions): string {
  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyJwt<T = jwt.JwtPayload>(token: string): T {
  return jwt.verify(token, getJwtSecret()) as T;
}



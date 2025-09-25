export const USE_DB = Boolean(process.env.DATABASE_URL);

export const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret";

export const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
export const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;


    
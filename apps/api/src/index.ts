import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pinoHttp from "pino-http";
import path from "path";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
// Type augmentation loaded by TypeScript; no runtime import needed

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(pinoHttp());

app.get("/health", (_req, res) => res.json({ ok: true }));

// Load OpenAPI from packages/shared regardless of CWD
const openapiPath = path.resolve(process.cwd(), "../../packages/shared/openapi_stub.yaml");
const openapiDoc = yaml.load(openapiPath);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));

// Routers
import chatRoutes from "./routes/chat.routes";
import kbRoutes from "./routes/kb.routes";
import ticketsRoutes from "./routes/tickets.routes";
import authRoutes from "./routes/auth.routes";
import { initAuth } from "./services/auth.service";

app.use("/chat", chatRoutes);
app.use("/", kbRoutes); // exposes GET /search
app.use("/tickets", ticketsRoutes);
app.use("/auth", authRoutes);

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
  try {
    await initAuth();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Auth init failed", e);
  }
});



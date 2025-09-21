import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pinoHttp from "pino-http";
import path from "path";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";

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

// (Stubs you will replace later)
app.get("/search", (_req, res) => res.json({ results: [] }));
app.post("/chat", (_req, res) => res.json({
  answer: "This is a stubbed answer.",
  citations: [],
  confidence: 0.0,
  unanswerable: false
}));
app.post("/tickets/triage", (_req, res) => res.json({
  category: "Billing",
  priority: "Low",
  suggested_reply: "Thanks for reaching out. (stub)",
  supports: [],
  confidence: 0.5,
  action: "AUTO_ACK_ONLY",
  sla: { first_response_minutes: 60, resolution_hours: 24 }
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
});



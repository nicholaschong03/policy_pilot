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

// Routers
import chatRoutes from "./routes/chat.routes";
import kbRoutes from "./routes/kb.routes";
import ticketsRoutes from "./routes/tickets.routes";

app.use("/chat", chatRoutes);
app.use("/", kbRoutes); // exposes GET /search
app.use("/tickets", ticketsRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
});



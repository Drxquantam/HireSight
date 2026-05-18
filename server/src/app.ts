import cors from "cors";
import express from "express";
import { createRequire } from "node:module";
import type { RequestHandler } from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { jobRoutes } from "./routes/jobRoutes.js";
import { resumeRoutes } from "./routes/resumeRoutes.js";

export const app = express();
const require = createRequire(import.meta.url);
const helmet = require("helmet") as () => RequestHandler;

app.use(helmet());
app.use(express.json({ limit: "15mb" }));
app.use(
  cors({
    origin(origin, callback) {
      callback(null, true);
    },
    credentials: false
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "hiresight-server" });
});

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "HireSight API",
    health: "/health"
  });
});

app.use("/api/resume", resumeRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/jobs", jobRoutes);
app.use(errorHandler);

export default app;

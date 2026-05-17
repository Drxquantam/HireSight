import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { jobRoutes } from "./routes/jobRoutes.js";
import { resumeRoutes } from "./routes/resumeRoutes.js";

export const app = express();

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

app.use("/api/resume", resumeRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/jobs", jobRoutes);
app.use(errorHandler);

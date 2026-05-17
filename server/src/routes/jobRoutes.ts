import { Router } from "express";
import { analyzeJob, deleteJob, getSavedJobs, saveJob } from "../controllers/jobController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateBody } from "../middleware/validate.js";
import { jobAnalyzeSchema, saveJobSchema } from "../schemas/jobSchemas.js";

export const jobRoutes = Router();

jobRoutes.post("/analyze", validateBody(jobAnalyzeSchema), asyncHandler(analyzeJob));
jobRoutes.get("/saved", asyncHandler(getSavedJobs));
jobRoutes.post("/save", validateBody(saveJobSchema), asyncHandler(saveJob));
jobRoutes.delete("/:id", asyncHandler(deleteJob));

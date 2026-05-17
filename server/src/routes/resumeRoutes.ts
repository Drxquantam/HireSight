import { Router } from "express";
import { uploadResume } from "../controllers/resumeController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateBody } from "../middleware/validate.js";
import { resumeUploadSchema } from "../schemas/jobSchemas.js";

export const resumeRoutes = Router();

resumeRoutes.post("/upload", validateBody(resumeUploadSchema), asyncHandler(uploadResume));

import { Router } from "express";
import { prepareCompanyAnalysis } from "../controllers/companyController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const companyRoutes = Router();

companyRoutes.post("/prepare", asyncHandler(prepareCompanyAnalysis));
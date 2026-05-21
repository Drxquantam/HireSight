import type { Request, Response } from "express";
import { prepareCompany } from "../services/companyPrepService.js";

export async function prepareCompanyAnalysis(req: Request, res: Response) {
  const { companyName, jobTitle, jobDescription, matchedSkills, missingSkills } = req.body;

  if (!companyName?.trim() || !jobTitle?.trim()) {
    return res.status(400).json({
      message: "Company name and job title are required."
    });
  }

  const analysis = await prepareCompany({
    companyName,
    jobTitle,
    jobDescription,
    matchedSkills,
    missingSkills
  });

  return res.json(analysis);
}
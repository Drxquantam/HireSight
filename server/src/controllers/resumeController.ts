import type { Request, Response } from "express";
import { isDbConnected } from "../config/db.js";
import { ResumeAnalysis } from "../models/ResumeAnalysis.js";
import { UserProfile } from "../models/UserProfile.js";
import { summarizeResume } from "../services/aiService.js";
import { env } from "../config/env.js";
import { upsertProfile } from "../services/memoryStore.js";
import { extractTextFromPdfBase64 } from "../services/pdfService.js";

export async function uploadResume(req: Request, res: Response) {
  const userId = String(req.header("x-user-id") || "local-user");
  const payload = req.body as { resumeText?: string; pdfBase64?: string; fileName?: string };
  const resumeText = payload.pdfBase64 ? await extractTextFromPdfBase64(payload.pdfBase64) : payload.resumeText ?? "";
  const result = await summarizeResume(resumeText);

  if (!isDbConnected) {
    upsertProfile({ userId, resumeText, resumeSummary: result.summary, skills: result.skills });
    return res.json({ summary: result.summary, skills: result.skills });
  }

  await UserProfile.findOneAndUpdate(
    { userId },
    { userId, resumeText, resumeSummary: result.summary, skills: result.skills },
    { upsert: true, new: true }
  );

  await ResumeAnalysis.create({
    userId,
    summary: result.summary,
    extractedSkills: result.skills,
    provider: env.aiProvider
  });

  res.json({ summary: result.summary, skills: result.skills });
}

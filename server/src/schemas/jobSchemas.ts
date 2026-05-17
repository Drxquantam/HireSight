import { z } from "zod";

export const resumeUploadSchema = z.object({
  fileName: z.string().min(1).max(180).optional(),
  pdfBase64: z.string().min(1000).max(12_000_000).optional(),
  resumeText: z.string().min(120).max(60000).optional()
}).refine((payload) => Boolean(payload.pdfBase64 || payload.resumeText), {
  message: "Upload a resume PDF or provide resume text"
});

export const jobAnalyzeSchema = z.object({
  url: z.string().url(),
  source: z.string().min(2).max(120),
  title: z.string().min(1).max(180),
  company: z.string().min(1).max(180),
  description: z.string().min(200).max(30000)
});

export const analysisSchema = z.object({
  companyName: z.string(),
  jobTitle: z.string(),
  matchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  atsSuggestions: z.array(z.string()),
  resumeBulletSuggestions: z.array(z.string()),
  interviewTopics: z.array(z.string()),
  projectRecommendations: z.array(z.string()),
  finalRecommendation: z.enum(["Apply", "Improve First"]),
  confidence: z.number().min(0).max(1)
});

export const saveJobSchema = jobAnalyzeSchema.extend({
  analysis: analysisSchema
});

export type JobAnalyzeInput = z.infer<typeof jobAnalyzeSchema>;
export type SaveJobInput = z.infer<typeof saveJobSchema>;
export type AiAnalysis = z.infer<typeof analysisSchema>;

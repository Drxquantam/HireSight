import type { Request, Response } from "express";
import { isDbConnected } from "../config/db.js";
import { SavedJob } from "../models/SavedJob.js";
import { UserProfile } from "../models/UserProfile.js";
import type { JobAnalyzeInput, SaveJobInput } from "../schemas/jobSchemas.js";
import { analyzeJobWithAi } from "../services/aiService.js";
import { addSavedJob, getProfile, listSavedJobs, removeSavedJob } from "../services/memoryStore.js";

function userIdFrom(req: Request) {
  return String(req.header("x-user-id") || "local-user");
}

export async function analyzeJob(req: Request, res: Response) {
  const userId = userIdFrom(req);
  const job = req.body as JobAnalyzeInput;
  const profile = isDbConnected ? await UserProfile.findOne({ userId }) : getProfile(userId);
  const resumeSummary = profile?.resumeSummary ?? "No resume uploaded yet. Evaluate only from generic software engineering expectations.";
  const analysis = await analyzeJobWithAi(job, resumeSummary);
  res.json(analysis);
}

export async function saveJob(req: Request, res: Response) {
  const userId = userIdFrom(req);
  const payload = req.body as SaveJobInput;
  if (!isDbConnected) {
    const saved = addSavedJob({
      userId,
      url: payload.url,
      source: payload.source,
      title: payload.title,
      company: payload.company,
      description: payload.description,
      ...payload.analysis
    });
    return res.status(201).json(saved);
  }

  const saved = await SavedJob.create({
    userId,
    url: payload.url,
    source: payload.source,
    title: payload.title,
    company: payload.company,
    description: payload.description,
    ...payload.analysis
  });
  res.status(201).json(saved);
}

export async function getSavedJobs(req: Request, res: Response) {
  const userId = userIdFrom(req);
  if (!isDbConnected) return res.json(listSavedJobs(userId));

  const jobs = await SavedJob.find({ userId }).sort({ createdAt: -1 }).limit(100);
  res.json(jobs);
}

export async function deleteJob(req: Request, res: Response) {
  const userId = userIdFrom(req);
  const jobId = String(req.params.id);
  if (!isDbConnected) {
    removeSavedJob(userId, jobId);
    return res.json({ ok: true });
  }

  await SavedJob.deleteOne({ _id: jobId, userId });
  res.json({ ok: true });
}

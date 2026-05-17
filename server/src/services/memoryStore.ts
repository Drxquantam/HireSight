import { randomUUID } from "node:crypto";
import type { AiAnalysis } from "../schemas/jobSchemas.js";

type Profile = {
  userId: string;
  resumeText: string;
  resumeSummary: string;
  skills: string[];
};

type MemorySavedJob = AiAnalysis & {
  _id: string;
  userId: string;
  url: string;
  source: string;
  title: string;
  company: string;
  description: string;
  createdAt: string;
};

const profiles = new Map<string, Profile>();
const savedJobs = new Map<string, MemorySavedJob>();

export function upsertProfile(profile: Profile) {
  profiles.set(profile.userId, profile);
}

export function getProfile(userId: string) {
  return profiles.get(userId);
}

export function addSavedJob(job: Omit<MemorySavedJob, "_id" | "createdAt">) {
  const saved: MemorySavedJob = {
    ...job,
    _id: randomUUID(),
    createdAt: new Date().toISOString()
  };
  savedJobs.set(saved._id, saved);
  return saved;
}

export function listSavedJobs(userId: string) {
  return Array.from(savedJobs.values())
    .filter((job) => job.userId === userId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function removeSavedJob(userId: string, id: string) {
  const existing = savedJobs.get(id);
  if (existing?.userId === userId) savedJobs.delete(id);
}

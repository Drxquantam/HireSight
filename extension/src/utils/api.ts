import type { AiAnalysis, CompanyPrep, ExtractedJob, SavedJob } from "../types";
import { getSettings } from "./storage";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const settings = await getSettings();
  let response: Response;
  try {
    response = await fetch(`${settings.backendUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-user-id": settings.userId,
        ...(init?.headers ?? {})
      }
    });
  } catch {
    throw new Error(`Backend is not reachable at ${settings.backendUrl}. Start the server and check Settings.`);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const fieldErrors = payload.issues?.fieldErrors;
    const details = fieldErrors
      ? Object.entries(fieldErrors)
          .flatMap(([field, messages]) => Array.isArray(messages) ? messages.map((message) => `${field}: ${message}`) : [])
          .join(" ")
      : "";
    throw new Error(details || payload.message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function uploadResumePdf(fileName: string, pdfBase64: string) {
  return request<{ summary: string }>("/api/resume/upload", {
    method: "POST",
    body: JSON.stringify({ fileName, pdfBase64 })
  });
}

export async function analyzeJob(job: ExtractedJob) {
  return request<AiAnalysis>("/api/job/analyze", {
    method: "POST",
    body: JSON.stringify(job)
  });
}

export async function prepareCompany(job: ExtractedJob, analysis: AiAnalysis | null) {
  return request<CompanyPrep>("/api/company/prepare", {
    method: "POST",
    body: JSON.stringify({
      companyName: analysis?.companyName || job.company,
      jobTitle: analysis?.jobTitle || job.title,
      jobDescription: job.description,
      matchedSkills: analysis?.matchedSkills ?? [],
      missingSkills: analysis?.missingSkills ?? []
    })
  });
}

export async function saveJob(job: ExtractedJob, analysis: AiAnalysis) {
  return request<SavedJob>("/api/jobs/save", {
    method: "POST",
    body: JSON.stringify({ ...job, analysis })
  });
}

export async function getSavedJobs() {
  return request<SavedJob[]>("/api/jobs/saved");
}

export async function deleteSavedJob(id: string) {
  return request<{ ok: true }>(`/api/jobs/${id}`, { method: "DELETE" });
}

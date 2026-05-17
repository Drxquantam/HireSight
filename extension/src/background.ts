import type { AiAnalysis, ExtractedJob, ExtensionSettings } from "./types";

const DEFAULT_SETTINGS: ExtensionSettings = {
  backendUrl: "http://localhost:4000",
  userId: "local-user"
};

async function getSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.local.get(["settings"]);
  return { ...DEFAULT_SETTINGS, ...(stored.settings ?? {}) };
}

async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
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

async function analyzeJob(job: ExtractedJob) {
  return backendRequest<AiAnalysis>("/api/job/analyze", {
    method: "POST",
    body: JSON.stringify(job)
  });
}

async function saveJob(job: ExtractedJob, analysis: AiAnalysis) {
  return backendRequest("/api/jobs/save", {
    method: "POST",
    body: JSON.stringify({ ...job, analysis })
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    settings: {
      backendUrl: "http://localhost:4000",
      userId: "local-user"
    }
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  await chrome.tabs.sendMessage(tab.id, { type: "AI_JOB_COPILOT_OPEN" }).catch(() => undefined);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "AI_JOB_COPILOT_BACKEND_REQUEST") return false;

  void (async () => {
    try {
      if (message.action === "analyzeJob") {
        const data = await analyzeJob(message.job as ExtractedJob);
        sendResponse({ ok: true, data });
        return;
      }

      if (message.action === "saveJob") {
        const data = await saveJob(message.job as ExtractedJob, message.analysis as AiAnalysis);
        sendResponse({ ok: true, data });
        return;
      }

      sendResponse({ ok: false, message: "Unknown backend action." });
    } catch (cause) {
      sendResponse({
        ok: false,
        message: cause instanceof Error ? cause.message : "Backend request failed."
      });
    }
  })();

  return true;
});

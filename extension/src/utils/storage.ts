import type { ExtensionSettings } from "../types";

const DEFAULT_SETTINGS: ExtensionSettings = {
  backendUrl: "http://localhost:4000",
  userId: "local-user"
};

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.local.get(["settings"]);
  return { ...DEFAULT_SETTINGS, ...(stored.settings ?? {}) };
}

export async function saveSettings(settings: Partial<ExtensionSettings>) {
  const current = await getSettings();
  await chrome.storage.local.set({ settings: { ...current, ...settings } });
}


import type { ExtractedJob } from "../types";

const jobSelectors = [
  "[class*='job-description']",
  "[class*='description']",
  "[class*='job-desc']",
  "[class*='styles_job-desc']",
  "[class*='styles_JDC']",
  "[id*='jobDescription']",
  "[data-testid*='job']",
  "main",
  "article"
];

function cleanText(text: unknown) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function textFrom(selector: string): string {
  return Array.from(document.querySelectorAll<HTMLElement>(selector))
    .map((node) => cleanText(node.innerText ?? ""))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0] ?? "";
}

function firstUsefulText(selectors: string[], maxLength = 180) {
  for (const selector of selectors) {
    const value = Array.from(document.querySelectorAll<HTMLElement>(selector))
      .map((node) => cleanText(node.innerText ?? node.textContent ?? ""))
      .find((text) => cleanText(text).length > 2 && cleanText(text).length < maxLength);
    if (value) return value;
  }
  return "";
}

function metaContent(...names: string[]) {
  for (const name of names) {
    const value = document.querySelector<HTMLMetaElement>(`meta[property="${name}"], meta[name="${name}"]`)?.content;
    if (value) return cleanText(value);
  }
  return "";
}

function visibleBodyText(): string {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const chunks: string[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (!parent) continue;
    const style = window.getComputedStyle(parent);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const text = cleanText(node.textContent ?? "");
    if (text && text.length > 20) chunks.push(text);
  }
  return chunks.join("\n").slice(0, 18000);
}

function descriptionFromBody(bodyText: string) {
  const safeBodyText = cleanText(bodyText);
  const markers = ["Job description", "Job Description", "Project Role Description", "Roles Responsibilities", "Role & responsibilities"];
  const markerIndex = markers
    .map((marker) => safeBodyText.indexOf(marker))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (markerIndex === undefined) return safeBodyText;
  return safeBodyText.slice(markerIndex, markerIndex + 18000);
}

function titleFromDocument() {
  const metaTitle = metaContent("og:title", "twitter:title");
  const raw = firstUsefulText([
    "h1",
    "[class*='title']",
    "[class*='jobTitle']",
    "[class*='designation']",
    "[data-testid*='title']"
  ]) || metaTitle || document.title;

  return cleanText(raw)
    .split("|")[0]
    .split("- Naukri")[0]
    .split(" at ")[0]
    .slice(0, 140);
}

function companyFromDocument(bodyText: string) {
  const safeBodyText = cleanText(bodyText);
  const explicit = firstUsefulText([
    "[class*='company']",
    "[class*='comp-name']",
    "[class*='companyName']",
    "[data-testid*='company']",
    "h2"
  ]);
  if (explicit) return explicit.slice(0, 140);

  const title = titleFromDocument();
  const titleIndex = safeBodyText.indexOf(title);
  const start = titleIndex >= 0 ? titleIndex + title.length : 0;
  const afterTitle = safeBodyText.slice(start, start + 220);
  const candidate = afterTitle
    .split(/\b(?:Reviews|review|years|Not Disclosed|Posted)\b/i)[0]
    .replace(/[★☆]\s*\d+(\.\d+)?/g, "")
    .trim();

  return (candidate || "Unknown company").slice(0, 140);
}

export function extractCurrentJob(): ExtractedJob {
  try {
    const bodyText = visibleBodyText();
    const selectorDescription = jobSelectors.map(textFrom).find((text) => cleanText(text).length > 250);
    const description = selectorDescription ?? descriptionFromBody(bodyText);
    const title = titleFromDocument() || "Detected job posting";
    const company = companyFromDocument(bodyText);

    return {
      url: location.href,
      source: location.hostname.replace(/^www\./, ""),
      title: cleanText(title).slice(0, 140),
      company: cleanText(company).slice(0, 140),
      description: cleanText(description || bodyText || document.body?.innerText || document.title).slice(0, 18000)
    };
  } catch {
    return {
      url: location.href,
      source: location.hostname.replace(/^www\./, ""),
      title: cleanText(document.title || "Detected job posting").slice(0, 140),
      company: "Unknown company",
      description: cleanText(document.body?.innerText || document.title || "Job description unavailable").slice(0, 18000)
    };
  }
}

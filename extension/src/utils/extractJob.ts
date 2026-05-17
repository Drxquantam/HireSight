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

function cleanText(text: string) {
  return text.replace(/\s+/g, " ").trim();
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
      .find((text) => text.length > 2 && text.length < maxLength);
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
  const markers = ["Job description", "Job Description", "Project Role Description", "Roles Responsibilities", "Role & responsibilities"];
  const markerIndex = markers
    .map((marker) => bodyText.indexOf(marker))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (markerIndex === undefined) return bodyText;
  return bodyText.slice(markerIndex, markerIndex + 18000);
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
  const explicit = firstUsefulText([
    "[class*='company']",
    "[class*='comp-name']",
    "[class*='companyName']",
    "[data-testid*='company']",
    "h2"
  ]);
  if (explicit) return explicit.slice(0, 140);

  const title = titleFromDocument();
  const afterTitle = bodyText.slice(bodyText.indexOf(title) + title.length, bodyText.indexOf(title) + title.length + 220);
  const candidate = afterTitle
    .split(/\b(?:Reviews|review|years|Not Disclosed|Posted)\b/i)[0]
    .replace(/[★☆]\s*\d+(\.\d+)?/g, "")
    .trim();

  return (candidate || "Unknown company").slice(0, 140);
}

export function extractCurrentJob(): ExtractedJob {
  const bodyText = visibleBodyText();
  const selectorDescription = jobSelectors.map(textFrom).find((text) => text.length > 250);
  const description = selectorDescription ?? descriptionFromBody(bodyText);
  const title = titleFromDocument() || "Detected job posting";
  const company = companyFromDocument(bodyText);

  return {
    url: location.href,
    source: location.hostname.replace(/^www\./, ""),
    title: title.slice(0, 140),
    company: company.slice(0, 140),
    description: description.slice(0, 18000)
  };
}

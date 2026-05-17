import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import styles from "../styles.css?inline";
import { analyzeJob, saveJob } from "../utils/api";
import { extractCurrentJob } from "../utils/extractJob";
import type { AiAnalysis, ExtractedJob } from "../types";
import { Sidebar } from "../sidebar/Sidebar";

function ContentApp() {
  const [job, setJob] = useState(() => extractCurrentJob());
  const [open, setOpen] = useState(job.description.length > 500);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis(jobOverride?: ExtractedJob) {
    const freshJob = jobOverride ?? extractCurrentJob();
    setJob(freshJob);
    setSaved(false);
    setLoading(true);
    setError(null);
    try {
      setAnalysis(await analyzeJob(freshJob));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to analyze this job.");
    } finally {
      setLoading(false);
    }
  }

  async function persistJob() {
    if (!analysis) return;
    setError(null);
    try {
      await saveJob(job, analysis);
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save this job.");
    }
  }

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message?.type === "AI_JOB_COPILOT_OPEN") {
        setJob(extractCurrentJob());
        setOpen(true);
      }
      if (message?.type === "AI_JOB_COPILOT_ANALYZE") {
        const freshJob = extractCurrentJob();
        setJob(freshJob);
        setOpen(true);
        void runAnalysis(freshJob);
      }
    });
  }, []);

  if (!open) return null;

  return (
    <Sidebar
      job={job}
      analysis={analysis}
      loading={loading}
      error={error}
      saved={saved}
      onAnalyze={runAnalysis}
      onSave={persistJob}
      onClose={() => setOpen(false)}
    />
  );
}

if (!document.getElementById("ai-job-copilot-root")) {
  const style = document.createElement("style");
  style.textContent = styles;
  const host = document.createElement("div");
  host.id = "ai-job-copilot-root";
  document.documentElement.append(style, host);
  createRoot(host).render(<ContentApp />);
}

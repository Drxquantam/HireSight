import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BarChart3, FileText, FileUp, Settings, WandSparkles } from "lucide-react";
import "../styles.css";
import { uploadResumePdf } from "../utils/api";
import { getSettings, saveSettings } from "../utils/storage";

function Popup() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeSummary, setResumeSummary] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void getSettings().then((settings) => setResumeSummary(settings.resumeSummary ?? ""));
  }, []);

  function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = String(reader.result);
        resolve(value.includes(",") ? value.split(",")[1] : value);
      };
      reader.onerror = () => reject(new Error("Could not read the selected PDF."));
      reader.readAsDataURL(file);
    });
  }

  async function submitResume() {
    if (!resumeFile) {
      setStatus("Choose a resume PDF first.");
      return;
    }
    if (resumeFile.type !== "application/pdf") {
      setStatus("Please upload a PDF resume.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const pdfBase64 = await fileToBase64(resumeFile);
      const result = await uploadResumePdf(resumeFile.name, pdfBase64);
      await saveSettings({ resumeSummary: result.summary });
      setResumeSummary(result.summary);
      setResumeFile(null);
      setStatus("Resume PDF uploaded. Skills extracted.");
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Resume upload failed.");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      const message = { type: "AI_JOB_COPILOT_ANALYZE" };
      const sent = await chrome.tabs.sendMessage(tab.id, message).then(() => true).catch(() => false);
      if (!sent) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["assets/content.js"]
        });
        await chrome.tabs.sendMessage(tab.id, message).catch(() => undefined);
      }
    }
    window.close();
  }

  return (
    <div className="w-[360px] bg-slate-950 p-4 text-slate-100">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-200">
          <WandSparkles className="h-4 w-4" />
          HireSight
        </div>
        <h1 className="mt-2 text-xl font-bold text-white">Resume-aware job analysis</h1>
      </div>

      <div className="glass-card rounded-lg p-4">
        {resumeSummary ? (
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Extracted skills</p>
            <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-200">{resumeSummary}</p>
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-300">Upload your resume PDF once. The backend extracts skills and stores a summary for analysis.</p>
        )}
        <label className="mt-4 flex h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-slate-900 p-4 text-center hover:border-blue-300/70">
          <FileText className="mb-2 h-7 w-7 text-blue-200" />
          <span className="text-sm font-medium text-white">{resumeFile ? resumeFile.name : "Choose resume PDF"}</span>
          <span className="mt-1 text-xs text-slate-400">PDF only · extracted securely by backend</span>
          <input
            className="hidden"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <button className="gradient-button mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" disabled={loading} onClick={submitResume}>
          <FileUp className="h-4 w-4" />
          {loading ? "Extracting..." : "Upload Resume PDF"}
        </button>
      </div>

      {status && <p className="mt-3 text-sm text-slate-300">{status}</p>}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15" onClick={analyzeCurrentTab}>Analyze</button>
        <a className="flex items-center justify-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15" href="dashboard.html" target="_blank"><BarChart3 className="h-3.5 w-3.5" /> Jobs</a>
        <a className="flex items-center justify-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15" href="options.html" target="_blank"><Settings className="h-3.5 w-3.5" /> Settings</a>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Popup />);

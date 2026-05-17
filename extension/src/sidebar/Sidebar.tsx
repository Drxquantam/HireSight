import { Bookmark, BriefcaseBusiness, CheckCircle2, Rocket, ShieldCheck, X } from "lucide-react";
import type { AiAnalysis, ExtractedJob } from "../types";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ScoreRing } from "../components/ScoreRing";

type Props = {
  job: ExtractedJob;
  analysis: AiAnalysis | null;
  loading: boolean;
  error: string | null;
  saved: boolean;
  onAnalyze: () => void;
  onSave: () => void;
  onClose: () => void;
};

function PillList({ items, tone = "blue" }: { items: string[]; tone?: "blue" | "rose" | "green" }) {
  const color = tone === "rose" ? "bg-rose-950 text-rose-100 ring-1 ring-rose-700/70" : tone === "green" ? "bg-emerald-950 text-emerald-100 ring-1 ring-emerald-700/70" : "bg-blue-950 text-blue-100 ring-1 ring-blue-700/70";
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`rounded-full px-3 py-1 text-xs ${color}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
      <ul className="space-y-2 text-sm leading-5 text-slate-200">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function Sidebar({ job, analysis, loading, error, saved, onAnalyze, onSave, onClose }: Props) {
  return (
    <aside className="fixed right-4 top-4 z-[2147483647] h-[calc(100vh-32px)] w-[380px] max-w-[calc(100vw-32px)] animate-[slideIn_.24s_ease-out] overflow-hidden rounded-xl border border-slate-700 bg-slate-950 text-slate-100 shadow-2xl">
      <style>{`@keyframes slideIn{from{transform:translateX(28px);opacity:.4}to{transform:translateX(0);opacity:1}}`}</style>
      <div className="flex h-full flex-col">
        <header className="border-b border-slate-800 bg-slate-950 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-200">
                <BriefcaseBusiness className="h-4 w-4" />
                HireSight
              </div>
              <h2 className="mt-2 line-clamp-2 text-lg font-bold text-white">{job.title}</h2>
              <p className="mt-1 text-xs text-slate-300">{job.company} · {job.source}</p>
            </div>
            <button className="rounded-md p-2 text-slate-300 hover:bg-slate-800" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 space-y-4 overflow-y-auto p-4">
          {loading && <LoadingSkeleton />}
          {error && (
            <div className="rounded-lg border border-rose-500/50 bg-rose-950 p-4 text-sm font-medium text-rose-100">
              {error}
            </div>
          )}
          {!loading && !analysis && !error && (
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
              <p className="text-sm leading-6 text-slate-200">Detected visible job text. Run analysis to compare it with your uploaded resume.</p>
              <button className="gradient-button mt-4 w-full rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-glow" onClick={onAnalyze}>
                Analyze this job
              </button>
            </div>
          )}
          {analysis && (
            <>
              <section className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <div className="flex items-center gap-4">
                  <ScoreRing score={analysis.matchScore} />
                  <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-indigo-900 px-3 py-1 text-xs font-medium text-indigo-100">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {analysis.finalRecommendation}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-200">Confidence: {Math.round(analysis.confidence * 100)}%</p>
                  </div>
                </div>
              </section>
              <section className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Matched Skills</h3>
                <PillList items={analysis.matchedSkills} tone="green" />
              </section>
              <section className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <h3 className="mb-3 text-sm font-semibold text-white">Missing Skills</h3>
                <PillList items={analysis.missingSkills} tone="rose" />
              </section>
              <Section title="ATS Improvement Suggestions" items={analysis.atsSuggestions} />
              <Section title="Resume Bullet Rewrite Suggestions" items={analysis.resumeBulletSuggestions} />
              <Section title="Likely Interview Topics" items={analysis.interviewTopics} />
              <Section title="Role-Specific Projects" items={analysis.projectRecommendations} />
            </>
          )}
        </main>

        <footer className="border-t border-slate-800 bg-slate-950 p-4">
          <button disabled={!analysis || saved} className="gradient-button flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={onSave}>
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {saved ? "Saved to dashboard" : "Save job to dashboard"}
          </button>
          <a className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-300 hover:text-white" href={chrome.runtime.getURL("dashboard.html")} target="_blank" rel="noreferrer">
            <Rocket className="h-3.5 w-3.5" />
            Open dashboard
          </a>
        </footer>
      </div>
    </aside>
  );
}

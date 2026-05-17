import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ExternalLink, Trash2 } from "lucide-react";
import "../styles.css";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { deleteSavedJob, getSavedJobs } from "../utils/api";
import type { SavedJob } from "../types";

function Dashboard() {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadJobs() {
    setLoading(true);
    setError("");
    try {
      setJobs(await getSavedJobs());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load saved jobs.");
    } finally {
      setLoading(false);
    }
  }

  async function removeJob(id: string) {
    await deleteSavedJob(id);
    setJobs((current) => current.filter((job) => job._id !== id));
  }

  useEffect(() => {
    void loadJobs();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-white">Saved Jobs Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">Track opportunities and prioritize the ones worth applying to now.</p>
        {loading && <div className="mt-8"><LoadingSkeleton /></div>}
        {error && <div className="mt-8 rounded-lg border border-rose-400/30 bg-rose-500/10 p-4 text-rose-100">{error}</div>}
        {!loading && !error && jobs.length === 0 && (
          <div className="mt-8"><EmptyState title="No saved jobs yet" body="Open a job posting, run the analysis, then save it here." /></div>
        )}
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <article
              key={job._id}
              className="group glass-card rounded-2xl p-5 shadow-[0_18px_45px_rgba(0,0,0,0.32)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-blue-400/50 hover:shadow-[0_24px_70px_rgba(37,99,235,0.22)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-xl px-1 py-1 transition-transform duration-300 group-hover:translate-x-1">
                  <h2 className="line-clamp-2 text-lg font-bold text-white drop-shadow-sm">{job.jobTitle || job.title}</h2>
                  <p className="mt-1 text-sm text-slate-400 transition-colors duration-300 group-hover:text-blue-200">{job.companyName || job.company} · {job.source}</p>
                </div>
                <div className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-bold text-blue-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] ring-1 ring-blue-300/10 transition-transform duration-300 group-hover:scale-110">{job.matchScore}%</div>
              </div>
              <p className="mt-4 text-sm text-slate-300">{job.finalRecommendation}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.missingSkills.slice(0, 4).map((skill) => (
                  <span key={skill} className="rounded-full bg-rose-500/12 px-3 py-1 text-xs text-rose-100 ring-1 ring-rose-300/10">{skill}</span>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2">
                <a className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs text-white transition hover:-translate-y-0.5 hover:bg-white/15" href={job.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
                <button className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs text-white transition hover:-translate-y-0.5 hover:bg-white/15" onClick={() => void removeJob(job._id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Dashboard />);

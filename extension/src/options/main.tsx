import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Save } from "lucide-react";
import "../styles.css";
import { getSettings, saveSettings } from "../utils/storage";

function Options() {
  const [backendUrl, setBackendUrl] = useState("http://localhost:4000");
  const [userId, setUserId] = useState("local-user");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void getSettings().then((settings) => {
      setBackendUrl(settings.backendUrl);
      setUserId(settings.userId);
    });
  }, []);

  async function save() {
    await saveSettings({ backendUrl, userId });
    setMessage("Settings saved.");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-sm text-slate-400">Connect the extension to your local or deployed backend.</p>
        <section className="glass-card mt-8 rounded-lg p-6">
          <label className="text-sm font-medium text-slate-200">Backend URL</label>
          <input className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-sm outline-none focus:border-blue-400" value={backendUrl} onChange={(event) => setBackendUrl(event.target.value)} />
          <label className="mt-5 block text-sm font-medium text-slate-200">User ID</label>
          <input className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-sm outline-none focus:border-blue-400" value={userId} onChange={(event) => setUserId(event.target.value)} />
          <button className="gradient-button mt-6 flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white" onClick={save}>
            <Save className="h-4 w-4" />
            Save settings
          </button>
          {message && <p className="mt-4 text-sm text-emerald-200">{message}</p>}
        </section>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Options />);


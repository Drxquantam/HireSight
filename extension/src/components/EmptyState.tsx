import { Sparkles } from "lucide-react";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass-card rounded-lg p-5 text-center">
      <Sparkles className="mx-auto mb-3 h-8 w-8 text-indigo-300" />
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}


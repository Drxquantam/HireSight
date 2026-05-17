export function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="relative grid h-28 w-28 place-items-center rounded-full" style={{ background: `conic-gradient(#60a5fa ${clamped * 3.6}deg, rgba(51,65,85,.75) 0)` }}>
      <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-950">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{clamped}%</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">Match</div>
        </div>
      </div>
    </div>
  );
}


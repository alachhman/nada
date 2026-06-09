export function StatPills({ streak, interceptCount }: { streak: number; interceptCount: number }) {
  const pill = "flex-1 rounded-2xl p-4 text-center";
  const style = { background: "var(--surface)", border: "1px solid var(--border)" };
  return (
    <div className="flex gap-3">
      <div className={pill} style={style}>
        <div className="text-xs" style={{ color: "var(--muted)" }}>Streak</div>
        <div className="text-2xl font-bold">{streak} {streak > 0 ? "🔥" : ""}</div>
      </div>
      <div className={pill} style={style}>
        <div className="text-xs" style={{ color: "var(--muted)" }}>Cravings handled</div>
        <div className="text-2xl font-bold">{interceptCount}</div>
      </div>
    </div>
  );
}

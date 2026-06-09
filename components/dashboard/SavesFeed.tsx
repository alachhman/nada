import { usd } from "@/lib/format";
import type { SaveEntry } from "@/lib/types";

export function SavesFeed({ saves }: { saves: SaveEntry[] }) {
  if (saves.length === 0) {
    return (
      <div className="text-center text-sm py-8" style={{ color: "var(--muted)" }}>
        No saves yet. Go fill a cart you'll never check out.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {saves.map((s, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="text-sm truncate pr-3">{s.items.join(", ")}</div>
          <div className="text-sm font-semibold" style={{ color: "var(--positive)" }}>
            +{usd(s.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}

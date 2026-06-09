import type { Review } from "@/lib/types";

export function ReviewBlock({ reviews }: { reviews: Review[] }) {
  return (
    <div className="space-y-3 mt-6">
      {reviews.map((r, i) => (
        <div key={i} className="rounded-xl p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            {"★".repeat(r.rating)} · {r.author}
          </div>
          <div className="text-sm mt-1">{r.text}</div>
        </div>
      ))}
    </div>
  );
}

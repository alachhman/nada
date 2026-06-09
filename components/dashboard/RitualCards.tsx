import Link from "next/link";

const SOON = [
  { emoji: "🛵", title: "Food delivery", desc: "Order, track a courier, never pay." },
  { emoji: "📱", title: "Doomscroll", desc: "An endless feed that owes you nothing." },
  { emoji: "🚬", title: "Smoke break", desc: "The pause, minus the cigarette." },
];

export function RitualCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Link
        href="/shop"
        className="rounded-2xl p-5 flex flex-col justify-between min-h-[120px]"
        style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
      >
        <div className="text-2xl">🛒</div>
        <div>
          <div className="font-semibold">Impulse shopping</div>
          <div className="text-sm opacity-90">Browse, cart, and get intercepted →</div>
        </div>
      </Link>
      {SOON.map((r) => (
        <div
          key={r.title}
          className="rounded-2xl p-5 flex flex-col justify-between min-h-[120px] relative"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", opacity: 0.7 }}
          aria-label={`${r.title} — coming soon`}
        >
          <div className="text-2xl">{r.emoji}</div>
          <div>
            <div className="font-semibold">{r.title}</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>{r.desc}</div>
          </div>
          <span
            className="absolute top-3 right-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full"
            style={{ background: "var(--bg)", color: "var(--muted)" }}
          >
            Soon
          </span>
        </div>
      ))}
    </div>
  );
}

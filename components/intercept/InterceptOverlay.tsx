"use client";

import { useEffect, useState } from "react";
import { usd } from "@/lib/format";

export function InterceptOverlay({
  amount,
  processingMs = 2000,
  onClose,
}: {
  amount: number;
  processingMs?: number;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"processing" | "done">("processing");

  useEffect(() => {
    const t = setTimeout(() => setPhase("done"), processingMs);
    return () => clearTimeout(t);
  }, [processingMs]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "var(--bg)" }}
    >
      {phase === "processing" ? (
        <div className="text-center">
          <div
            className="mx-auto mb-5 h-10 w-10 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
          />
          <div className="text-lg font-medium">Placing your order…</div>
          <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Contacting payment processor
          </div>
        </div>
      ) : (
        <div className="text-center max-w-sm">
          <div className="text-5xl">🌱</div>
          <div className="text-xs uppercase tracking-[0.15em] mt-3" style={{ color: "var(--muted)" }}>
            Craving handled
          </div>
          <div className="text-5xl font-bold mt-2" style={{ color: "var(--positive)" }}>
            You saved {usd(amount)}
          </div>
          <p className="text-sm mt-3" style={{ color: "var(--muted)" }}>
            You got the hunt, the pick, the click — and kept the money. That’s the whole trick.
          </p>
          <button
            onClick={onClose}
            className="mt-6 rounded-xl py-3 px-6 font-semibold"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            Back to dashboard
          </button>
        </div>
      )}
    </div>
  );
}

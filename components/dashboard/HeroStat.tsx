"use client";

import { CountUp } from "@/components/ui/CountUp";

export function HeroStat({ totalSaved }: { totalSaved: number }) {
  return (
    <div className="text-center py-10">
      <div className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
        Saved with nada
      </div>
      <div className="text-6xl font-bold mt-2" style={{ color: "var(--positive)" }}>
        <CountUp value={totalSaved} />
      </div>
      <div className="text-sm mt-2" style={{ color: "var(--muted)" }}>
        you spent nada. nice work.
      </div>
    </div>
  );
}

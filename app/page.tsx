"use client";

import { AppHeader } from "@/components/ui/AppHeader";
import { useNada } from "@/components/providers/NadaProvider";
import { HeroStat } from "@/components/dashboard/HeroStat";
import { StatPills } from "@/components/dashboard/StatPills";
import { SavesFeed } from "@/components/dashboard/SavesFeed";
import { RitualCards } from "@/components/dashboard/RitualCards";

export default function Dashboard() {
  const { state, hydrated } = useNada();
  return (
    <main className="min-h-screen">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-5 pb-16">
        <HeroStat totalSaved={hydrated ? state.totalSaved : 0} />
        <StatPills streak={state.streak} interceptCount={state.interceptCount} />
        <div className="mt-8">
          <div className="text-xs uppercase tracking-[0.15em] mb-3" style={{ color: "var(--muted)" }}>
            Rituals
          </div>
          <RitualCards />
        </div>
        <div className="mt-8">
          <div className="text-xs uppercase tracking-[0.15em] mb-3" style={{ color: "var(--muted)" }}>
            Recent saves
          </div>
          <SavesFeed saves={state.saves} />
        </div>
      </div>
    </main>
  );
}

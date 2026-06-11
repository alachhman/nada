import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Reveal } from "@/components/ui/Reveal";
import { router } from "expo-router";
import { tokens } from "@/lib/theme";
import { useNada } from "@/components/providers/NadaProvider";
import { useScroll } from "@/components/providers/ScrollProvider";
import { useBreaks } from "@/components/providers/BreakProvider";
import { HeroStat } from "@/components/you/HeroStat";
import { StatPills } from "@/components/you/StatPills";
import { SavesFeed } from "@/components/you/SavesFeed";
import { ReclaimedBlock } from "@/components/you/ReclaimedBlock";
import { BreaksBlock } from "@/components/you/BreaksBlock";
import { InsightsTeaser } from "@/components/you/InsightsTeaser";
import { MONETIZATION_ENABLED, PRESENCE_ENABLED } from "@/lib/flags";
import { PresenceTicker } from "@/components/you/PresenceTicker";

const STAGGER = 80;

type RitualConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  tint: string;
  route: string;
};

const RITUALS: RitualConfig[] = [
  { icon: "bicycle-outline", title: "Food delivery", tint: tokens.colors.peach, route: "/food" },
  { icon: "phone-portrait-outline", title: "Doomscroll", tint: tokens.colors.sage, route: "/scroll" },
  { icon: "flame-outline", title: "Smoke break", tint: tokens.colors.lilac, route: "/break" },
];

export default function YouScreen() {
  const { state, reset } = useNada();
  const { reset: resetScroll } = useScroll();
  const { reset: resetBreaks } = useBreaks();

  let stagger = 0;
  const nextDelay = () => stagger++ * STAGGER;

  const handleReset = () => {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    resetScroll();
    resetBreaks();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero */}
        <Reveal delay={nextDelay()}>
          <HeroStat totalSaved={state.totalSaved} />
        </Reveal>

        {/* Streak + Cravings pills */}
        <Reveal delay={nextDelay()}>
          <StatPills streak={state.streak} interceptCount={state.interceptCount} />
        </Reveal>

        {/* Co-presence feed — additive, only when flag is on.
            Flag-off = today's UX exactly (no wrapper rendered). */}
        {PRESENCE_ENABLED && (
          <Reveal delay={nextDelay()}>
            <View style={styles.presenceSection}>
              <PresenceTicker />
            </View>
          </Reveal>
        )}

        {/* Reclaimed + Breaks two-up row */}
        <Reveal delay={nextDelay()}>
          <View style={styles.statsRow}>
            <ReclaimedBlock />
            <BreaksBlock />
          </View>
        </Reveal>

        {/* Insights teaser — additive, only when monetization is enabled.
            Flag-off = today's UX exactly. */}
        {MONETIZATION_ENABLED && (
          <Reveal delay={nextDelay()}>
            <View style={styles.insightsSection}>
              <InsightsTeaser />
            </View>
          </Reveal>
        )}

        {/* Rituals section */}
        <Reveal delay={nextDelay()}>
          <View style={styles.ritualsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Rituals</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Replace habits, not just purchases.
            </Text>
            <View style={styles.ritualsGrid}>
              {RITUALS.map((ritual) => (
                <RitualCard key={ritual.route} ritual={ritual} />
              ))}
            </View>
          </View>
        </Reveal>

        {/* Recent saves */}
        <Reveal delay={nextDelay()}>
          <View style={styles.savesSection}>
            <SavesFeed saves={state.saves} />
          </View>
        </Reveal>

        {/* Footer links — subtle: why this works + reset */}
        <Reveal delay={nextDelay()}>
          <View style={styles.resetRow}>
            <Pressable
              onPress={() => router.push("/why")}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Why this works"
            >
              <Text style={styles.whyText}>why this works</Text>
            </Pressable>
            <Pressable
              onPress={handleReset}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Reset all savings data"
            >
              <Text style={styles.resetText}>reset data</Text>
            </Pressable>
          </View>
        </Reveal>
      </ScrollView>
    </SafeAreaView>
  );
}

function RitualCard({ ritual }: { ritual: RitualConfig }) {
  const handlePress = () => {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(ritual.route as Parameters<typeof router.push>[0]);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${ritual.title} ritual`}
      style={({ pressed }) => [
        styles.ritualCard,
        { backgroundColor: ritual.tint + "88" },
        pressed && { opacity: 0.75 },
      ]}
    >
      <View style={[styles.ritualIconBg, { backgroundColor: ritual.tint }]}>
        <Ionicons name={ritual.icon} size={20} color={tokens.colors.ink} />
      </View>
      <Text style={styles.ritualTitle} numberOfLines={1}>
        {ritual.title}
      </Text>
      <Text style={styles.ritualCta}>Try it →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  scroll: {
    paddingBottom: tokens.space.xxxl + tokens.space.xl,
  },

  /* Co-presence ticker */
  presenceSection: {
    paddingHorizontal: tokens.space.xl,
    marginTop: tokens.space.xxl,
  },

  /* Reclaimed + Breaks two-up row */
  statsRow: {
    flexDirection: "row",
    gap: tokens.space.md,
    paddingHorizontal: tokens.space.xl,
    marginTop: tokens.space.xxl,
  },

  /* Insights teaser */
  insightsSection: {
    paddingHorizontal: tokens.space.xl,
    marginTop: tokens.space.xxl,
  },

  /* Rituals section */
  ritualsSection: {
    paddingHorizontal: tokens.space.xl,
    marginTop: tokens.space.xxl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.space.sm,
    marginBottom: tokens.space.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 13.5,
    fontWeight: "500",
    color: tokens.colors.muted,
    marginBottom: tokens.space.lg,
  },
  ritualsGrid: {
    flexDirection: "row",
    gap: tokens.space.md,
  },
  ritualCard: {
    flex: 1,
    borderRadius: tokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
    paddingVertical: tokens.space.lg,
    paddingHorizontal: tokens.space.md,
    alignItems: "center",
    gap: tokens.space.sm,
    position: "relative",
  },
  ritualIconBg: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  ritualTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.ink,
    textAlign: "center",
  },
  ritualCta: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.ink,
    letterSpacing: 0.2,
    opacity: 0.65,
  },
  /* Saves feed spacing */
  savesSection: {
    marginTop: tokens.space.xxl,
  },

  /* Footer links */
  resetRow: {
    alignItems: "center",
    marginTop: tokens.space.xxxl,
    gap: tokens.space.md,
  },
  whyText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: tokens.colors.muted,
    letterSpacing: 0.2,
  },
  resetText: {
    fontSize: 12,
    fontWeight: "500",
    color: tokens.colors.hairline,
    letterSpacing: 0.2,
  },
});

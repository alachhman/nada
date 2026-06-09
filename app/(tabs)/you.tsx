import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Reveal } from "@/components/ui/Reveal";
import { router } from "expo-router";
import { tokens } from "@/lib/theme";
import { useNada } from "@/components/providers/NadaProvider";
import { HeroStat } from "@/components/you/HeroStat";
import { StatPills } from "@/components/you/StatPills";
import { SavesFeed } from "@/components/you/SavesFeed";
import { ReclaimedBlock } from "@/components/you/ReclaimedBlock";

const STAGGER = 80;

type RitualCard = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  tint: string;
};

const RITUALS: RitualCard[] = [
  { icon: "bicycle-outline", title: "Food delivery", tint: tokens.colors.peach },
  { icon: "phone-portrait-outline", title: "Doomscroll", tint: tokens.colors.sage },
  { icon: "flame-outline", title: "Smoke break", tint: tokens.colors.lilac },
];

export default function YouScreen() {
  const { state, reset } = useNada();

  let stagger = 0;
  const nextDelay = () => stagger++ * STAGGER;

  const handleReset = () => {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
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

        {/* Reclaimed block */}
        <Reveal delay={nextDelay()}>
          <View style={styles.reclaimedSection}>
            <ReclaimedBlock />
          </View>
        </Reveal>

        {/* Rituals section */}
        <Reveal delay={nextDelay()}>
          <View style={styles.ritualsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Rituals</Text>
              <View style={styles.soonBadge}>
                <Text style={styles.soonBadgeText}>Soon</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>
              Replace habits, not just purchases.
            </Text>
            <View style={styles.ritualsGrid}>
              <FoodRitualCard ritual={RITUALS[0]} />
              <DoomscrollRitualCard ritual={RITUALS[1]} />
              <RitualCard ritual={RITUALS[2]} />
            </View>
          </View>
        </Reveal>

        {/* Recent saves */}
        <Reveal delay={nextDelay()}>
          <View style={styles.savesSection}>
            <SavesFeed saves={state.saves} />
          </View>
        </Reveal>

        {/* Reset button — subtle, for testing */}
        <Reveal delay={nextDelay()}>
          <View style={styles.resetRow}>
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

function FoodRitualCard({ ritual }: { ritual: RitualCard }) {
  const handlePress = () => {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/food");
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Open Food delivery ritual"
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

function DoomscrollRitualCard({ ritual }: { ritual: RitualCard }) {
  const handlePress = () => {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/scroll");
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Open Doomscroll ritual"
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

function RitualCard({ ritual }: { ritual: RitualCard }) {
  return (
    <View style={[styles.ritualCard, { backgroundColor: ritual.tint + "55" }]}>
      <View style={[styles.ritualIconBg, { backgroundColor: ritual.tint }]}>
        <Ionicons name={ritual.icon} size={20} color={tokens.colors.ink} />
      </View>
      <Text style={styles.ritualTitle} numberOfLines={1}>
        {ritual.title}
      </Text>
      <View style={styles.ritualLock}>
        <Ionicons name="lock-closed-outline" size={11} color={tokens.colors.muted} />
      </View>
    </View>
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

  /* Reclaimed block */
  reclaimedSection: {
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
  soonBadge: {
    backgroundColor: tokens.colors.butter,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.space.sm,
    paddingVertical: 3,
  },
  soonBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.ink,
    letterSpacing: 0.3,
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
  ritualLock: {
    position: "absolute",
    top: tokens.space.sm,
    right: tokens.space.sm,
  },

  /* Saves feed spacing */
  savesSection: {
    marginTop: tokens.space.xxl,
  },

  /* Reset */
  resetRow: {
    alignItems: "center",
    marginTop: tokens.space.xxxl,
  },
  resetText: {
    fontSize: 12,
    fontWeight: "500",
    color: tokens.colors.hairline,
    letterSpacing: 0.2,
  },
});

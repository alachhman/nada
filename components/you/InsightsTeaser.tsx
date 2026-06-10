import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { tokens } from "@/lib/theme";
import { useNada } from "@/components/providers/NadaProvider";
import { useScroll } from "@/components/providers/ScrollProvider";
import { usePremium } from "@/components/providers/PremiumProvider";
import { buildWeeklySummary } from "@/lib/insights";

export function InsightsTeaser() {
  const { isPremium } = usePremium();
  const { state: nada } = useNada();
  const { state: scroll } = useScroll();

  if (isPremium) {
    // Premium: same card, unlocked, showing a small sample summary derived
    // from existing state — no new data collected.
    const summary = buildWeeklySummary({
      totalSaved: nada.totalSaved,
      cravingsHandled: nada.interceptCount,
      secondsReclaimed: scroll.secondsReclaimed,
    });

    return (
      <View style={[styles.card, styles.cardUnlocked]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Weekly report</Text>
          <View style={[styles.badge, styles.badgeOwned]}>
            <Text style={styles.badgeText}>✓ nada+</Text>
          </View>
        </View>
        <Text style={styles.summaryLead}>This week</Text>
        <Text style={styles.summaryLine}>· {summary.spend}</Text>
        <Text style={styles.summaryLine}>· {summary.cravings}</Text>
        <Text style={styles.summaryLine}>· {summary.reclaimed}</Text>
      </View>
    );
  }

  // Free: soft lock — a muted placeholder line + "Unlock insights".
  const openPaywall = () => {
    if (Platform.OS !== "web")
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/paywall");
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Weekly report</Text>
        <View style={styles.badge}>
          <Ionicons name="lock-closed" size={11} color={tokens.colors.muted} />
          <Text style={styles.badgeText}>nada+</Text>
        </View>
      </View>

      {/* Muted, blurred-feel placeholder sample */}
      <View style={styles.placeholderBlock}>
        <View style={[styles.placeholderBar, { width: "82%" }]} />
        <View style={[styles.placeholderBar, { width: "64%" }]} />
        <View style={[styles.placeholderBar, { width: "73%" }]} />
      </View>

      <Pressable
        onPress={openPaywall}
        accessibilityRole="button"
        accessibilityLabel="Unlock insights with nada+"
        style={({ pressed }) => [styles.unlockRow, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.unlockText}>Unlock insights</Text>
        <Ionicons name="arrow-forward" size={15} color={tokens.colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
    paddingVertical: tokens.space.xl,
    paddingHorizontal: tokens.space.xl,
    gap: tokens.space.md,
    ...tokens.shadow.card,
  },
  cardUnlocked: {
    gap: tokens.space.xs,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.3,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: tokens.colors.bg,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.space.sm,
    paddingVertical: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
  },
  badgeOwned: {
    backgroundColor: tokens.colors.sage,
    borderColor: "transparent",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.muted,
    letterSpacing: 0.2,
  },

  /* Free placeholder */
  placeholderBlock: {
    gap: tokens.space.sm,
    paddingVertical: tokens.space.xs,
  },
  placeholderBar: {
    height: 12,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.hairline,
    opacity: 0.7,
  },
  unlockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.space.xs,
  },
  unlockText: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.1,
  },

  /* Premium summary */
  summaryLead: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: tokens.space.xs,
    marginBottom: tokens.space.xs,
  },
  summaryLine: {
    fontSize: 15,
    fontWeight: "600",
    color: tokens.colors.ink,
    lineHeight: 22,
  },
});

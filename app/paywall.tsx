import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { tokens } from "@/lib/theme";
import { usePremium } from "@/components/providers/PremiumProvider";

const STAGGER = 70;

type PerkConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  line: string;
};

// Honest perk list, drawn from spec §1 — no hype.
const PERKS: PerkConfig[] = [
  { icon: "bar-chart-outline", line: "Weekly & monthly insight reports" },
  { icon: "planet-outline", line: "More worlds — stores, restaurants, feeds" },
  { icon: "color-palette-outline", line: "Themes & alternate app icons" },
  { icon: "flag-outline", line: "Goals, milestones & shareable cards" },
  { icon: "apps-outline", line: "Home-screen widgets" },
  { icon: "swap-horizontal-outline", line: "“Make it real” savings automation" },
];

type PlanId = "monthly" | "yearly" | "lifetime";

type PlanConfig = {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  badge?: string;
};

const PLANS: PlanConfig[] = [
  { id: "monthly", name: "Monthly", price: "$2.99", cadence: "/mo" },
  {
    id: "yearly",
    name: "Yearly",
    price: "$19.99",
    cadence: "/yr",
    badge: "best value · 7-day trial",
  },
  { id: "lifetime", name: "Lifetime", price: "$39.99", cadence: "once" },
];

export default function PaywallScreen() {
  const { setPremium } = usePremium();
  const [selected, setSelected] = useState<PlanId>("yearly");

  let stagger = 0;
  const nextDelay = () => stagger++ * STAGGER;

  const dismiss = () => {
    if (Platform.OS !== "web")
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleUnlock = () => {
    if (Platform.OS !== "web")
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // PLACEHOLDER: until RevenueCat is wired, just grant the local entitlement.
    // TODO(revenuecat): call purchase(selectedPackage) and grant on success.
    setPremium(true);
    router.back();
  };

  const selectPlan = (id: PlanId) => {
    if (Platform.OS !== "web")
      void Haptics.selectionAsync();
    setSelected(id);
  };

  const isTrialPlan = selected === "yearly";
  const ctaLabel = isTrialPlan ? "Start free trial" : "Unlock nada+";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Top bar: equal-weight dismiss — never trap the user. */}
        <View style={styles.topBar}>
          <Pressable
            onPress={dismiss}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="close" size={22} color={tokens.colors.ink} />
          </Pressable>
        </View>

        {/* Header */}
        <Reveal delay={nextDelay()}>
          <View style={styles.header}>
            <Text style={styles.wordmark}>
              nada<Text style={styles.plus}>+</Text>
            </Text>
            <Text style={styles.tagline}>
              costs less than the thing you almost bought.
            </Text>
          </View>
        </Reveal>

        {/* Value list */}
        <Reveal delay={nextDelay()}>
          <View style={styles.perks}>
            {PERKS.map((perk) => (
              <View key={perk.line} style={styles.perkRow}>
                <View style={styles.perkIcon}>
                  <Ionicons name={perk.icon} size={17} color={tokens.colors.ink} />
                </View>
                <Text style={styles.perkText}>{perk.line}</Text>
              </View>
            ))}
          </View>
        </Reveal>

        {/* Plan options */}
        <Reveal delay={nextDelay()}>
          <View style={styles.plans}>
            {PLANS.map((plan) => {
              const active = plan.id === selected;
              return (
                <Pressable
                  key={plan.id}
                  onPress={() => selectPlan(plan.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${plan.name} ${plan.price}${
                    plan.badge ? ` — ${plan.badge}` : ""
                  }`}
                  style={[styles.planCard, active && styles.planCardActive]}
                >
                  <View style={styles.planRadio}>
                    <Ionicons
                      name={active ? "ellipse" : "ellipse-outline"}
                      size={20}
                      color={active ? tokens.colors.accent : tokens.colors.hairline}
                    />
                  </View>
                  <View style={styles.planBody}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {plan.badge ? (
                      <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>{plan.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.planPriceWrap}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planCadence}>{plan.cadence}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Reveal>

        {/* Primary CTA + honest fine print */}
        <Reveal delay={nextDelay()}>
          <View style={styles.ctaWrap}>
            <PillButton label={ctaLabel} onPress={handleUnlock} />

            {__DEV__ ? (
              <Text style={styles.demoNote}>demo — purchases not yet live</Text>
            ) : null}

            <Text style={styles.finePrint}>
              Cancel anytime. No ads, no tracking, ever.
            </Text>

            {/* Second, equal-weight dismiss — never a forced wall. */}
            <Pressable
              onPress={dismiss}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Maybe later"
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.maybeLater}>Maybe later</Text>
            </Pressable>
          </View>
        </Reveal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  scroll: {
    paddingHorizontal: tokens.space.xl,
    paddingBottom: tokens.space.xxxl,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingVertical: tokens.space.sm,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
  },

  /* Header */
  header: {
    marginTop: tokens.space.md,
    marginBottom: tokens.space.xl,
  },
  wordmark: {
    fontSize: 40,
    fontWeight: "900",
    color: tokens.colors.ink,
    letterSpacing: -1.2,
  },
  plus: {
    color: tokens.colors.positive,
  },
  tagline: {
    marginTop: tokens.space.sm,
    fontSize: 15,
    fontWeight: "500",
    color: tokens.colors.muted,
    letterSpacing: -0.2,
  },

  /* Perks */
  perks: {
    gap: tokens.space.md,
    marginBottom: tokens.space.xl,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.space.md,
  },
  perkIcon: {
    width: 34,
    height: 34,
    borderRadius: tokens.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
  },
  perkText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "600",
    color: tokens.colors.ink,
  },

  /* Plans */
  plans: {
    gap: tokens.space.md,
    marginBottom: tokens.space.xl,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.space.md,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: 1.5,
    borderColor: tokens.colors.hairline,
    paddingVertical: tokens.space.lg,
    paddingHorizontal: tokens.space.lg,
  },
  planCardActive: {
    borderColor: tokens.colors.accent,
    ...tokens.shadow.card,
  },
  planRadio: {
    width: 22,
    alignItems: "center",
  },
  planBody: {
    flex: 1,
    gap: tokens.space.xs,
  },
  planName: {
    fontSize: 16,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.3,
  },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: tokens.colors.sage,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.space.sm,
    paddingVertical: 2,
  },
  planBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: tokens.colors.ink,
    letterSpacing: 0.2,
  },
  planPriceWrap: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: tokens.colors.ink,
    letterSpacing: -0.5,
  },
  planCadence: {
    fontSize: 11,
    fontWeight: "600",
    color: tokens.colors.muted,
  },

  /* CTA */
  ctaWrap: {
    alignItems: "center",
    gap: tokens.space.md,
  },
  demoNote: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.muted,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  finePrint: {
    fontSize: 12.5,
    fontWeight: "500",
    color: tokens.colors.muted,
    textAlign: "center",
  },
  maybeLater: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.ink,
    letterSpacing: 0.1,
    paddingVertical: tokens.space.sm,
  },
});

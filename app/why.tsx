import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Reveal } from "@/components/ui/Reveal";
import { tokens } from "@/lib/theme";

const STAGGER = 80;

type Para = { body: string };

const PARAS: Para[] = [
  {
    body:
      "You're in on it. nada is openly fake — there's no warehouse, no courier, nothing ships. What's real is the ritual: the browse, the cart, the checkout, the little hit of having decided. We let you have all of that and quietly keep the money.",
  },
  {
    body:
      "The craving doesn't actually want the box. It wants the hunt, the pick, the click. So we give the loop a real ending — an intercept — and then we show you the win: the dollars you kept, the things that never showed up at your door. The urge gets its shape; you get the savings.",
  },
  {
    body:
      "This isn't just a theory. The person who built the original fake-delivery app found that running her own simulator extinguished her real ordering habit — she said she couldn't stand the sight of actual delivery apps anymore. Rehearsing the ritual honestly, with the ending built in, turned out to be the opposite of a relapse.",
  },
  {
    body:
      "And there's nothing to sell you. No ads, no tracking, no upsell to a thing you don't need. A fake store has no reason to push product — which means the only thing nada is optimizing for is you not spending.",
  },
];

type Section = { heading: string; body: string };

const SECTIONS: Section[] = [
  {
    heading: 'the "right now" feed',
    body: 'if you opt in (it\'s off by default), your saves appear to others as exactly four anonymous facts: the ritual, the rounded amount, your region word (from your timezone — never gps, never your address), and a timestamp. no ids, no accounts, nothing that can be traced back to you. turn it off any time and nothing leaves your phone.',
  },
];

export default function WhyScreen() {
  let stagger = 0;
  const nextDelay = () => stagger++ * STAGGER;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <Reveal style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={tokens.colors.ink} />
        </Pressable>
        <View style={styles.backButton} />
      </Reveal>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Reveal delay={nextDelay()}>
          <Text style={styles.kicker}>THE HONEST PART</Text>
          <Text style={styles.title}>why this works</Text>
        </Reveal>

        {PARAS.map((p) => (
          <Reveal key={p.body.slice(0, 24)} delay={nextDelay()}>
            <Text style={styles.body}>{p.body}</Text>
          </Reveal>
        ))}

        {SECTIONS.map((s) => (
          <Reveal key={s.heading} delay={nextDelay()}>
            <Text style={styles.sectionHeading}>{s.heading}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </Reveal>
        ))}

        <Reveal delay={nextDelay()}>
          <Text style={styles.footer}>🌱 nothing sold. nothing tracked. nothing shipped.</Text>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.space.xl,
    paddingVertical: tokens.space.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.md,
    paddingBottom: tokens.space.xxxl + tokens.space.xl,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: tokens.colors.muted,
    marginBottom: tokens.space.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: tokens.colors.ink,
    letterSpacing: -0.8,
    marginBottom: tokens.space.xl,
  },
  body: {
    fontSize: 15.5,
    lineHeight: 24,
    fontWeight: "500",
    color: tokens.colors.ink,
    marginBottom: tokens.space.xl,
  },
  sectionHeading: {
    fontSize: 15.5,
    fontWeight: "800",
    color: tokens.colors.ink,
    marginBottom: tokens.space.sm,
    letterSpacing: -0.2,
  },
  footer: {
    marginTop: tokens.space.lg,
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: "600",
    color: tokens.colors.muted,
    letterSpacing: 0.2,
  },
});

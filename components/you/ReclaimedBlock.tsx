import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@/lib/theme";
import { useScroll } from "@/components/providers/ScrollProvider";
import { formatDuration } from "@/lib/duration";

export function ReclaimedBlock() {
  const { state } = useScroll();

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>RECLAIMED</Text>
      <Text style={styles.duration}>
        {formatDuration(state.secondsReclaimed)}
      </Text>
      <Text style={styles.sub}>of guilt-free scrolling</Text>
      {state.streak > 0 && (
        <View style={styles.streakPill}>
          <Text style={styles.streakText}>{state.streak} 🌀</Text>
        </View>
      )}
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
    alignItems: "center",
    gap: tokens.space.xs,
    ...tokens.shadow.card,
  },
  heading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: tokens.colors.muted,
    textTransform: "uppercase",
  },
  duration: {
    fontSize: 40,
    fontWeight: "900",
    color: tokens.colors.positive,
    letterSpacing: -1,
    lineHeight: 48,
  },
  sub: {
    fontSize: 13,
    fontWeight: "500",
    color: tokens.colors.muted,
    textAlign: "center",
  },
  streakPill: {
    marginTop: tokens.space.xs,
    backgroundColor: tokens.colors.sage,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.xs,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
});

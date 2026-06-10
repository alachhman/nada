import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@/lib/theme";
import { useBreaks } from "@/components/providers/BreakProvider";
import { formatDuration } from "@/lib/duration";

export function BreaksBlock() {
  const { state } = useBreaks();
  const { breaksTaken, secondsAway } = state;

  const sub =
    secondsAway > 0
      ? `${formatDuration(secondsAway)} away from cigarettes`
      : "step outside sometime";

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>BREAKS</Text>
      <Text style={styles.count}>{breaksTaken} taken</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
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
  count: {
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
});

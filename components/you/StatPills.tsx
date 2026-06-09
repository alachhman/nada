import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@/lib/theme";

interface StatPillsProps {
  streak: number;
  interceptCount: number;
}

export function StatPills({ streak, interceptCount }: StatPillsProps) {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <Text style={styles.value}>
          {streak}
          {streak > 0 ? " 🔥" : ""}
        </Text>
        <Text style={styles.cardLabel}>Streak</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.value}>{interceptCount}</Text>
        <Text style={styles.cardLabel}>Cravings handled</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: tokens.space.md,
    paddingHorizontal: tokens.space.xl,
  },
  card: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
    paddingVertical: tokens.space.xl,
    paddingHorizontal: tokens.space.lg,
    alignItems: "center",
    gap: tokens.space.xs,
    ...tokens.shadow.card,
  },
  value: {
    fontSize: 34,
    fontWeight: "900",
    color: tokens.colors.ink,
    letterSpacing: -0.5,
  },
  cardLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: tokens.colors.muted,
    textAlign: "center",
  },
});

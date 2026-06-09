import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@/lib/theme";
import { usd } from "@/lib/format";
import type { SaveEntry } from "@/lib/types";

interface SavesFeedProps {
  saves: SaveEntry[];
}

export function SavesFeed({ saves }: SavesFeedProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent saves</Text>
      {saves.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No saves yet. Go fill a cart you&apos;ll never check out.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {saves.map((entry, i) => (
            <View key={`${entry.timestamp}-${i}`} style={styles.row}>
              <Text style={styles.itemNames} numberOfLines={1}>
                {entry.items.join(", ")}
              </Text>
              <Text style={styles.amount}>+{usd(entry.amount)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: tokens.space.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.4,
    marginBottom: tokens.space.md,
  },
  emptyState: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
    paddingVertical: tokens.space.xxl,
    paddingHorizontal: tokens.space.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14.5,
    fontWeight: "500",
    color: tokens.colors.muted,
    textAlign: "center",
    lineHeight: 21,
  },
  list: {
    gap: tokens.space.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
    paddingVertical: tokens.space.md + 2,
    paddingHorizontal: tokens.space.lg,
    ...tokens.shadow.card,
  },
  itemNames: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "600",
    color: tokens.colors.ink,
    marginRight: tokens.space.md,
  },
  amount: {
    fontSize: 15,
    fontWeight: "800",
    color: tokens.colors.positive,
    letterSpacing: -0.2,
  },
});

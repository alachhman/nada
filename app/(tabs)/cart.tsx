import { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { tokens } from "@/lib/theme";
import { usd } from "@/lib/format";
import { cartWeight, formatWeight } from "@/lib/dodge";
import { useCart } from "@/components/providers/CartProvider";
import { useNada } from "@/components/providers/NadaProvider";
import { usePresence } from "@/components/providers/PresenceProvider";
import { PillButton } from "@/components/ui/PillButton";
import { CartLine } from "@/components/cart/CartLine";
import { InterceptOverlay } from "@/components/intercept/InterceptOverlay";
import { OTHERS_LINE_THRESHOLD } from "@/lib/presence";
import { PRESENCE_ENABLED } from "@/lib/flags";

export default function CartScreen() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const { intercept } = useNada();
  const { enabled, post, todayStats } = usePresence();
  const [overlay, setOverlay] = useState<{ amount: number; itemCount: number; weightLb: number } | null>(null);

  const checkout = () => {
    if (items.length === 0) return;
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Capture saved amount + total quantity + weight BEFORE clearing — clear() would zero them out.
    const saved = intercept(items);
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
    const weight = cartWeight(items, (id) => items.find((i) => i.id === id)?.weightLb);
    post("shop", saved);
    clear();
    setOverlay({ amount: saved, itemCount, weightLb: weight });
  };

  const handleClose = () => {
    setOverlay(null);
    router.push("/(tabs)/you");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your cart&apos;s empty</Text>
          <Text style={styles.emptyBody}>Go fill it with things you won&apos;t buy.</Text>
          <PillButton
            label="Browse the shop"
            icon="storefront-outline"
            onPress={() => router.push("/(tabs)")}
            style={styles.emptyCta}
          />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Your cart</Text>
            {items.map((item) => (
              <CartLine key={item.id} item={item} />
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{usd(total)}</Text>
            </View>
            {(() => {
              const w = cartWeight(items, (id) => items.find((i) => i.id === id)?.weightLb);
              return w > 0 ? (
                <Text style={styles.clutterRow}>total clutter: {formatWeight(w)}</Text>
              ) : null;
            })()}
            <PillButton label="Check out" onPress={checkout} />
            <Text style={styles.deadpan}>you know how this ends</Text>
          </View>
        </>
      )}

      {overlay ? (
        <InterceptOverlay
          amount={overlay.amount}
          itemCount={overlay.itemCount}
          weightLb={overlay.weightLb > 0 ? overlay.weightLb : undefined}
          othersToday={
            enabled && PRESENCE_ENABLED && todayStats && todayStats.count >= OTHERS_LINE_THRESHOLD
              ? todayStats.count
              : undefined
          }
          onClose={handleClose}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  /* empty */
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.space.xxxl,
    gap: tokens.space.sm,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  emptyBody: {
    fontSize: 15,
    color: tokens.colors.muted,
    textAlign: "center",
  },
  emptyCta: {
    marginTop: tokens.space.lg,
  },
  /* list */
  list: {
    padding: tokens.space.xl,
    gap: tokens.space.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: tokens.colors.ink,
    marginBottom: tokens.space.sm,
  },
  /* footer */
  footer: {
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.lg,
    paddingBottom: tokens.space.lg,
    backgroundColor: tokens.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.hairline,
    gap: tokens.space.md,
    ...tokens.shadow.lifted,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: tokens.colors.muted,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "900",
    color: tokens.colors.ink,
  },
  clutterRow: {
    fontSize: 12.5,
    color: tokens.colors.muted,
    textAlign: "right",
    marginTop: -tokens.space.xs,
  },
  deadpan: {
    fontSize: 12.5,
    color: tokens.colors.muted,
    textAlign: "center",
    fontStyle: "italic",
  },
});

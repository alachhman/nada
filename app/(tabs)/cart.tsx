import { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { tokens } from "@/lib/theme";
import { usd } from "@/lib/format";
import { useCart } from "@/components/providers/CartProvider";
import { useNada } from "@/components/providers/NadaProvider";
import { PillButton } from "@/components/ui/PillButton";
import { CartLine } from "@/components/cart/CartLine";
import { InterceptOverlay } from "@/components/intercept/InterceptOverlay";

export default function CartScreen() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const { intercept } = useNada();
  const [overlay, setOverlay] = useState<{ amount: number } | null>(null);

  const checkout = () => {
    if (items.length === 0) return;
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Capture saved amount BEFORE clearing — clear() would zero it out.
    const saved = intercept(items);
    clear();
    setOverlay({ amount: saved });
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
            <PillButton label="Check out" onPress={checkout} />
            <Text style={styles.deadpan}>you know how this ends</Text>
          </View>
        </>
      )}

      {overlay ? (
        <InterceptOverlay amount={overlay.amount} onClose={handleClose} />
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
  deadpan: {
    fontSize: 12.5,
    color: tokens.colors.muted,
    textAlign: "center",
    fontStyle: "italic",
  },
});

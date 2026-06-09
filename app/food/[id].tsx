import { useEffect } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Reveal } from "@/components/ui/Reveal";
import { tokens } from "@/lib/theme";
import { usd } from "@/lib/format";
import { getRestaurant } from "@/lib/food";
import { useFoodOrder } from "@/components/providers/FoodOrderProvider";
import { MenuItemRow } from "@/components/food/MenuItemRow";
import { PillButton } from "@/components/ui/PillButton";

const BLURHASH = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";
const ORDER_BAR_HEIGHT = 90;

export default function MenuScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { restaurant, setRestaurant, items, total } = useFoodOrder();
  const insets = useSafeAreaInsets();

  const found = getRestaurant(id ?? "");

  // Set restaurant context on mount, keyed on id to avoid infinite re-renders
  useEffect(() => {
    if (found) {
      setRestaurant(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found?.id]);

  // Not found state
  if (!found) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="storefront-outline" size={52} color={tokens.colors.muted} />
          <Text style={styles.emptyTitle}>Restaurant not found</Text>
          <Text style={styles.emptySubtitle}>
            This spot may have moved or no longer exists.
          </Text>
          <PillButton
            label="Back"
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/food");
            }}
            variant="solid"
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Order totals
  const count = items.reduce((s, i) => s + i.qty, 0);
  const hasItems = count > 0;
  const itemWord = count === 1 ? "item" : "items";
  const deliveryLabel =
    found.deliveryFee === 0 ? "Free delivery" : `${usd(found.deliveryFee)} delivery`;
  const bottomPad = Math.max(insets.bottom, tokens.space.lg);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Floating back button — sits above the hero image */}
      <View style={styles.backWrap} pointerEvents="box-none">
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/food");
          }}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={tokens.colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: hasItems ? ORDER_BAR_HEIGHT + tokens.space.xl : tokens.space.xxxl },
        ]}
      >
        {/* Hero banner */}
        <Reveal delay={40} distance={0}>
          <Image
            source={found.image}
            placeholder={{ blurhash: BLURHASH }}
            contentFit="cover"
            transition={300}
            style={styles.heroBanner}
          />
        </Reveal>

        {/* Restaurant info block */}
        <Reveal delay={120} style={styles.infoBlock}>
          <Text style={styles.restaurantName}>{found.name}</Text>
          <Text style={styles.cuisineLabel}>{found.cuisine}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>★ {found.rating.toFixed(1)}</Text>
            <Text style={styles.metaDot}> · </Text>
            <Text style={styles.metaText}>{found.etaMins} min</Text>
            <Text style={styles.metaDot}> · </Text>
            <Text style={styles.metaText}>{deliveryLabel}</Text>
          </View>
        </Reveal>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Menu heading */}
        <Reveal delay={180} distance={8} style={styles.menuHeader}>
          <Text style={styles.menuHeading}>Menu</Text>
        </Reveal>

        {/* Menu items */}
        {found.menu.map((item, i) => (
          <Reveal key={item.id} delay={200 + i * 40} distance={10}>
            <MenuItemRow item={item} />
          </Reveal>
        ))}
      </ScrollView>

      {/* Sticky order bar — outside ScrollView */}
      {hasItems ? (
        <Reveal delay={0} distance={30} style={[styles.orderBar, { paddingBottom: bottomPad }]}>
          <PillButton
            label={`View order · ${count} ${itemWord} · ${usd(total)}`}
            onPress={() => router.push("/food/track")}
            variant="solid"
            style={styles.orderBarButton}
          />
        </Reveal>
      ) : (
        <View style={[styles.orderBarEmpty, { paddingBottom: bottomPad }]}>
          <Text style={styles.orderBarEmptyText}>Add items to start your order</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  backWrap: {
    position: "absolute",
    top: Platform.select({ ios: 56, android: 48, default: 56 }),
    left: tokens.space.xl,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...tokens.shadow.card,
  },
  scroll: {
    // no horizontal padding at root — hero is full-bleed
  },
  heroBanner: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: tokens.colors.bg,
  },
  infoBlock: {
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.lg,
    gap: 4,
  },
  restaurantName: {
    fontSize: 26,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  cuisineLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: tokens.colors.muted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: tokens.space.xs,
    flexWrap: "wrap",
  },
  metaText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: tokens.colors.muted,
  },
  metaDot: {
    fontSize: 12.5,
    color: tokens.colors.hairline,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: tokens.colors.hairline,
    marginHorizontal: tokens.space.xl,
    marginTop: tokens.space.xl,
  },
  menuHeader: {
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.lg,
    paddingBottom: tokens.space.xs,
  },
  menuHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.3,
  },
  // Order bar (has items)
  orderBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.lg,
    backgroundColor: tokens.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.hairline,
    ...tokens.shadow.lifted,
  },
  orderBarButton: {
    // fills the bar
  },
  // Order bar (empty)
  orderBarEmpty: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.lg,
    backgroundColor: tokens.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.hairline,
    alignItems: "center",
  },
  orderBarEmptyText: {
    fontSize: 13,
    fontWeight: "500",
    color: tokens.colors.muted,
    textAlign: "center",
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.space.xl,
    gap: tokens.space.md,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: tokens.colors.muted,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: tokens.space.md,
  },
});

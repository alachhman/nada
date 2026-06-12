import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { tokens } from "@/lib/theme";
import { usd } from "@/lib/format";
import { formatWeight } from "@/lib/dodge";
import type { Product } from "@/lib/types";
import { RatingStars } from "./RatingStars";

interface ProductCardProps {
  product: Product;
  /** "grid" flexes to ~half width; "rail" is a fixed width for horizontal scroll. */
  layout?: "grid" | "rail";
}

const SPRING = { damping: 15, stiffness: 300, mass: 0.6 };
const RAIL_WIDTH = 168;
// Items at/above this price get a pastel savings badge.
const DEAL_THRESHOLD = 100;
const BLURHASH = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

/**
 * Deterministic hash of an id string to a float in [0, 1).
 * Pure function of the string — same id always returns the same value.
 * Uses djb2-style mixing followed by a mulberry32 avalanche step to
 * ensure well-scattered output even for short, near-identical strings
 * like "gen-0", "gen-1", "gen-2", …
 */
function idHash(id: string): number {
  let seed = 0;
  for (let i = 0; i < id.length; i++) {
    seed = (Math.imul(seed, 31) + id.charCodeAt(i)) | 0;
  }
  // mulberry32 avalanche
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Returns a deal badge for the product, or null.
 * Gate 1: price must meet the threshold.
 * Gate 2: deterministic hash of the product id must fall in the bottom ~25%,
 *         so roughly 1-in-4 eligible products shows a badge.
 * Same product → same badge outcome every render (pure function of id).
 */
function dealBadge(price: number, id: string): { label: string; bg: string } | null {
  if (price >= DEAL_THRESHOLD && idHash(id) < 0.25) {
    const pct = price >= 180 ? 30 : price >= 140 ? 25 : 20;
    return { label: `-${pct}%`, bg: tokens.colors.peach };
  }
  return null;
}

export function ProductCard({ product, layout = "grid" }: ProductCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPressIn = () => {
    scale.value = withSpring(0.96, SPRING);
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, SPRING);
  };

  const badge = dealBadge(product.price, product.id);

  return (
    <Animated.View
      style={[animatedStyle, layout === "rail" ? styles.railWrap : styles.gridWrap]}
    >
      <Pressable
        onPress={() => router.push(`/product/${product.id}`)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${usd(product.price)}`}
      >
        <View style={styles.imageWrap}>
          <Image
            source={product.image}
            placeholder={{ blurhash: BLURHASH }}
            contentFit="cover"
            transition={250}
            style={styles.image}
          />
          {badge ? (
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={styles.badgeText}>{badge.label}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          <View style={styles.priceRow}>
            <Text style={styles.price}>{usd(product.price)}</Text>
            <Text style={styles.weightChip}>{formatWeight(product.weightLb)}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gridWrap: {
    flex: 1,
  },
  railWrap: {
    width: RAIL_WIDTH,
  },
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    overflow: "hidden",
    ...tokens.shadow.card,
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: tokens.colors.bg,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: tokens.space.sm,
    left: tokens.space.sm,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: tokens.radius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: 0.2,
  },
  body: {
    padding: tokens.space.md,
    gap: 5,
  },
  name: {
    fontSize: 13.5,
    fontWeight: "600",
    color: tokens.colors.ink,
    lineHeight: 18,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 1,
  },
  price: {
    fontSize: 17,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  weightChip: {
    fontSize: 11,
    fontWeight: "500",
    color: tokens.colors.muted,
  },
});

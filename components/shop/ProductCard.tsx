import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { tokens } from "@/lib/theme";
import { usd } from "@/lib/format";
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

function dealBadge(price: number): { label: string; bg: string } | null {
  if (price >= DEAL_THRESHOLD) {
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

  const badge = dealBadge(product.price);

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
          <Text style={styles.price}>{usd(product.price)}</Text>
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
  price: {
    fontSize: 17,
    fontWeight: "800",
    color: tokens.colors.ink,
    marginTop: 1,
  },
});

import { useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { tokens } from "@/lib/theme";
import { getProduct } from "@/lib/catalog";

interface Deal {
  headline: string;
  cta: string;
  bg: string;
  productId: string;
}

const DEALS: Deal[] = [
  { headline: "Treat yourself to nothing", cta: "Browse deals", bg: tokens.colors.peach, productId: "retro-runner" },
  { headline: "Big savings on $0", cta: "See how", bg: tokens.colors.sage, productId: "noise-buds" },
  { headline: "Add to cart.\nKeep the cash.", cta: "Start saving", bg: tokens.colors.lilac, productId: "smart-watch" },
];

const SCREEN_W = Dimensions.get("window").width;
const H_PAD = tokens.space.xl;
const GAP = tokens.space.md;
const CARD_W = SCREEN_W - H_PAD * 2;
const SNAP = CARD_W + GAP;
const CARD_H = 168;

export function DealCarousel() {
  const scrollX = useSharedValue(0);
  const [page, setPage] = useState(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  return (
    <View>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          setPage(Math.round(e.nativeEvent.contentOffset.x / SNAP));
        }}
      >
        {DEALS.map((deal, i) => (
          <DealBanner key={i} deal={deal} index={i} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>
      <View style={styles.dots}>
        {DEALS.map((_, i) => (
          <View key={i} style={[styles.dot, i === page ? styles.dotActive : styles.dotIdle]} />
        ))}
      </View>
    </View>
  );
}

function DealBanner({
  deal,
  index,
  scrollX,
}: {
  deal: Deal;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const product = getProduct(deal.productId);

  const cardStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];
    const scale = interpolate(scrollX.value, inputRange, [0.94, 1, 0.94], Extrapolation.CLAMP);
    return { transform: [{ scale }] };
  });

  // Subtle parallax on the peeking product image.
  const imageStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];
    const translateX = interpolate(scrollX.value, inputRange, [40, 0, -40], Extrapolation.CLAMP);
    return { transform: [{ translateX }] };
  });

  return (
    <Animated.View style={[styles.card, { backgroundColor: deal.bg }, cardStyle]}>
      <View style={styles.cardText}>
        <Text style={styles.eyebrow}>nada deals</Text>
        <Text style={styles.headline}>{deal.headline}</Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>{deal.cta}</Text>
        </View>
      </View>
      {product ? (
        <Animated.View style={[styles.imageWrap, imageStyle]}>
          <Image source={product.image} contentFit="cover" transition={300} style={styles.image} />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: H_PAD,
    gap: GAP,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: tokens.radius.xl,
    overflow: "hidden",
    flexDirection: "row",
    ...tokens.shadow.card,
  },
  cardText: {
    flex: 1,
    padding: tokens.space.xl,
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: tokens.colors.ink,
    opacity: 0.55,
    marginBottom: tokens.space.sm,
  },
  headline: {
    fontSize: 23,
    fontWeight: "800",
    lineHeight: 27,
    color: tokens.colors.ink,
    letterSpacing: -0.4,
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: tokens.space.md,
    backgroundColor: tokens.colors.accent,
    paddingHorizontal: tokens.space.lg,
    paddingVertical: 8,
    borderRadius: tokens.radius.pill,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.accentFg,
  },
  imageWrap: {
    width: 150,
    height: "100%",
    justifyContent: "center",
  },
  image: {
    position: "absolute",
    width: 180,
    height: 180,
    right: -28,
    top: -6,
    borderRadius: tokens.radius.lg,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: tokens.space.md,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
    backgroundColor: tokens.colors.accent,
  },
  dotIdle: {
    width: 6,
    backgroundColor: tokens.colors.hairline,
  },
});
